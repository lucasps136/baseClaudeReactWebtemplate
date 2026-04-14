// Stripe Payment Provider - SOLID implementation using composition
// Delegates to specialized operation classes following SRP

import "server-only";

import Stripe from "stripe";

import { envServer } from "@/config/env.server";
import type {
  IPaymentProvider,
  IProduct,
  IPrice,
  ICustomer,
  ISubscription,
  IPaymentIntent,
  ICheckoutSession,
  IWebhookEvent,
  IPaymentError,
  ICreateSubscriptionOptions,
  ICreateCheckoutSessionOptions,
  ICreatePaymentIntentOptions,
} from "@/shared/types/payments";

// Import operation classes
import { CheckoutOperations } from "./operations/checkout-operations";
import { CustomerOperations } from "./operations/customer-operations";
import { PaymentOperations } from "./operations/payment-operations";
import { ProductOperations } from "./operations/product-operations";
import { SubscriptionOperations } from "./operations/subscription-operations";
import { WebhookOperations } from "./operations/webhook-operations";

export class StripePaymentProvider implements IPaymentProvider {
  private stripe: Stripe;
  private webhookSecret?: string;

  // Operation delegates (Dependency Injection + Single Responsibility)
  private productOps: ProductOperations;
  private customerOps: CustomerOperations;
  private subscriptionOps: SubscriptionOperations;
  private paymentOps: PaymentOperations;
  private checkoutOps: CheckoutOperations;
  private webhookOps: WebhookOperations;

  constructor() {
    if (!envServer.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY is required to use StripePaymentProvider",
      );
    }
    this.stripe = new Stripe(envServer.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
    this.webhookSecret = envServer.STRIPE_WEBHOOK_SECRET;

    // Initialize operation classes
    this.productOps = new ProductOperations(this.stripe);
    this.customerOps = new CustomerOperations(this.stripe);
    this.subscriptionOps = new SubscriptionOperations(this.stripe);
    this.paymentOps = new PaymentOperations(this.stripe);
    this.checkoutOps = new CheckoutOperations(this.stripe);
    this.webhookOps = new WebhookOperations(this.stripe, this.webhookSecret);
  }

  // Product operations - delegate to ProductOperations
  async getProducts(): Promise<IProduct[]> {
    return this.productOps.getProducts(
      this.mapStripeProduct,
      this.mapStripeError,
    );
  }
  async getProduct(productId: string): Promise<IProduct | null> {
    return this.productOps.getProduct(
      productId,
      this.mapStripeProduct,
      this.mapStripeError,
    );
  }
  async getPrices(productId?: string): Promise<IPrice[]> {
    return this.productOps.getPrices(
      productId,
      this.mapStripePrice,
      this.mapStripeError,
    );
  }
  async getPrice(priceId: string): Promise<IPrice | null> {
    return this.productOps.getPrice(
      priceId,
      this.mapStripePrice,
      this.mapStripeError,
    );
  }

  // Customer operations - delegate to CustomerOperations
  async createCustomer(
    data: Omit<ICustomer, "id" | "stripeCustomerId">,
  ): Promise<ICustomer> {
    return this.customerOps.createCustomer(
      data,
      this.mapStripeCustomer,
      this.mapStripeError,
    ) as Promise<ICustomer>;
  }
  async getCustomer(customerId: string): Promise<ICustomer | null> {
    return this.customerOps.getCustomer(
      customerId,
      this.mapStripeCustomer,
      this.mapStripeError,
    );
  }
  async updateCustomer(
    customerId: string,
    data: Partial<ICustomer>,
  ): Promise<ICustomer> {
    return this.customerOps.updateCustomer(
      customerId,
      data,
      this.mapStripeCustomer,
      this.mapStripeError,
    );
  }
  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.stripe.customers.del(customerId);
    } catch (error) {
      throw this.mapStripeError(error);
    }
  }

  // Subscription operations - delegate to SubscriptionOperations
  async createSubscription(
    customerId: string,
    priceId: string,
    options?: ICreateSubscriptionOptions,
  ): Promise<ISubscription> {
    return this.subscriptionOps.createSubscription(customerId, priceId, {
      options: options || {},
      mapSubscription: this.mapStripeSubscription,
      mapError: this.mapStripeError,
    });
  }
  async getSubscription(subscriptionId: string): Promise<ISubscription | null> {
    return this.subscriptionOps.getSubscription(
      subscriptionId,
      this.mapStripeSubscription,
      this.mapStripeError,
    );
  }
  async getCustomerSubscriptions(customerId: string): Promise<ISubscription[]> {
    return this.subscriptionOps.getCustomerSubscriptions(
      customerId,
      this.mapStripeSubscription,
      this.mapStripeError,
    );
  }
  async updateSubscription(
    subscriptionId: string,
    data: Partial<ISubscription>,
  ): Promise<ISubscription> {
    return this.subscriptionOps.updateSubscription(
      subscriptionId,
      data,
      this.mapStripeSubscription,
      this.mapStripeError,
    );
  }
  async cancelSubscription(
    subscriptionId: string,
    immediately: boolean = false,
  ): Promise<ISubscription> {
    return this.subscriptionOps.cancelSubscription(
      subscriptionId,
      immediately,
      this.mapStripeSubscription,
      this.mapStripeError,
    );
  }

  // Payment operations - delegate to PaymentOperations
  async createPaymentIntent(
    options: ICreatePaymentIntentOptions,
  ): Promise<IPaymentIntent> {
    return this.paymentOps.createPaymentIntent(
      options,
      this.mapStripePaymentIntent,
      this.mapStripeError,
    );
  }
  async getPaymentIntent(
    paymentIntentId: string,
  ): Promise<IPaymentIntent | null> {
    return this.paymentOps.getPaymentIntent(
      paymentIntentId,
      this.mapStripePaymentIntent,
      this.mapStripeError,
    );
  }
  async confirmPaymentIntent(paymentIntentId: string): Promise<IPaymentIntent> {
    return this.paymentOps.confirmPaymentIntent(
      paymentIntentId,
      this.mapStripePaymentIntent,
      this.mapStripeError,
    );
  }
  async cancelPaymentIntent(paymentIntentId: string): Promise<IPaymentIntent> {
    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      return this.mapStripePaymentIntent(intent);
    } catch (error) {
      throw this.mapStripeError(error);
    }
  }

  // Checkout operations - delegate to CheckoutOperations
  async createCheckoutSession(
    options: ICreateCheckoutSessionOptions,
  ): Promise<ICheckoutSession> {
    return this.checkoutOps.createCheckoutSession(
      options,
      this.mapStripeCheckoutSession,
      this.mapStripeError,
    );
  }
  async getCheckoutSession(
    sessionId: string,
  ): Promise<ICheckoutSession | null> {
    return this.checkoutOps.getCheckoutSession(
      sessionId,
      this.mapStripeCheckoutSession,
      this.mapStripeError,
    );
  }

  // Webhook operations
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
      return true;
    } catch {
      return false;
    }
  }

  async processWebhookEvent(
    event: Record<string, unknown>,
  ): Promise<IWebhookEvent> {
    return this.mapStripeWebhookEvent(event as unknown as Stripe.Event);
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return { url: session.url };
    } catch (error) {
      throw this.mapStripeError(error);
    }
  }

  async initialize(): Promise<void> {}
  async cleanup(): Promise<void> {}

  // Mapper functions (kept in main class as they're specific to Stripe->Internal mapping)
  private mapStripeProduct = (product: Stripe.Product): IProduct => ({
    id: product.id,
    name: product.name,
    description: product.description || undefined,
    active: product.active,
    image:
      product.images && product.images.length > 0
        ? product.images[0]
        : undefined,
    metadata: product.metadata,
  });

  private mapStripePrice = (price: Stripe.Price): IPrice => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount || 0,
    interval: price.recurring?.interval as IPrice["interval"],
    intervalCount: price.recurring?.interval_count,
    metadata: price.metadata,
  });

  private mapStripeCustomer = (customer: Stripe.Customer): ICustomer => ({
    id: customer.id,
    stripeCustomerId: customer.id,
    email: customer.email || "",
    name: customer.name || undefined,
    phone: customer.phone || undefined,
  });

  private mapStripeSubscription = (
    subscription: Stripe.Subscription,
  ): ISubscription => ({
    id: subscription.id,
    userId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    status: subscription.status as ISubscription["status"],
    priceId: subscription.items.data[0]?.price.id || "",
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000)
      : undefined,
    metadata: subscription.metadata,
  });

  private mapStripePaymentIntent = (
    paymentIntent: Stripe.PaymentIntent,
  ): IPaymentIntent => ({
    id: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    status: paymentIntent.status as IPaymentIntent["status"],
    customerId:
      typeof paymentIntent.customer === "string"
        ? paymentIntent.customer
        : paymentIntent.customer?.id,
    clientSecret: paymentIntent.client_secret || "",
    metadata: paymentIntent.metadata,
  });

  private mapStripeCheckoutSession = (
    session: Stripe.Checkout.Session,
  ): ICheckoutSession => ({
    id: session.id,
    customerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    mode: session.mode as ICheckoutSession["mode"],
    status: session.status as ICheckoutSession["status"],
    url: session.url || "",
  });

  private mapStripeWebhookEvent = (event: Stripe.Event): IWebhookEvent => ({
    id: event.id,
    type: event.type,
    data: event.data.object,
    created: new Date(event.created * 1000),
    processed: false,
  });

  private mapStripeError = (error: unknown): IPaymentError => {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        name: "StripeError",
        code: error.code || "unknown",
        message: error.message,
        type: (error.type as IPaymentError["type"]) || "api_error",
        details: { statusCode: error.statusCode },
      };
    }
    return {
      name: "UnknownPaymentError",
      code: "unknown",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      type: "api_error",
      details: error,
    };
  };
}
