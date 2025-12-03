// Stripe Payment Provider - SOLID implementation using composition
// Delegates to specialized operation classes following SRP

import Stripe from "stripe";

import { getEnv } from "@/config/env";
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
    const env = getEnv();
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
      typescript: true,
    });
    this.webhookSecret = env.STRIPE_WEBHOOK_SECRET;

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
  async getProduct(productId: string): Promise<IProduct> {
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
  async getPrice(priceId: string): Promise<IPrice> {
    return this.productOps.getPrice(
      priceId,
      this.mapStripePrice,
      this.mapStripeError,
    );
  }

  // Customer operations - delegate to CustomerOperations
  async createCustomer(
    email: string,
    metadata?: Record<string, string>,
  ): Promise<ICustomer> {
    return this.customerOps.createCustomer(
      email,
      metadata,
      this.mapStripeCustomer,
      this.mapStripeError,
    );
  }
  async getCustomer(customerId: string): Promise<ICustomer> {
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
    return this.customerOps.deleteCustomer(customerId, this.mapStripeError);
  }

  // Subscription operations - delegate to SubscriptionOperations
  async createSubscription(
    options: ICreateSubscriptionOptions,
  ): Promise<ISubscription> {
    return this.subscriptionOps.createSubscription(
      options,
      this.mapStripeSubscription,
      this.mapStripeError,
    );
  }
  async getSubscription(subscriptionId: string): Promise<ISubscription> {
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
  async getPaymentIntent(paymentIntentId: string): Promise<IPaymentIntent> {
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
    return this.paymentOps.cancelPaymentIntent(
      paymentIntentId,
      this.mapStripePaymentIntent,
      this.mapStripeError,
    );
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
  async getCheckoutSession(sessionId: string): Promise<ICheckoutSession> {
    return this.checkoutOps.getCheckoutSession(
      sessionId,
      this.mapStripeCheckoutSession,
      this.mapStripeError,
    );
  }

  // Webhook operations - delegate to WebhookOperations
  async handleWebhook(
    payload: string,
    signature: string,
  ): Promise<IWebhookEvent> {
    return this.webhookOps.handleWebhook(
      payload,
      signature,
      this.mapStripeWebhookEvent,
      this.mapStripeError,
    );
  }

  // Mapper functions (kept in main class as they're specific to Stripe->Internal mapping)
  private mapStripeProduct = (product: Stripe.Product): IProduct => ({
    id: product.id,
    name: product.name,
    description: product.description || undefined,
    active: product.active,
    images: product.images,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
    metadata: product.metadata,
    created: product.created,
    updated: product.updated || product.created,
  });

  private mapStripePrice = (price: Stripe.Price): IPrice => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    active: price.active,
    currency: price.currency,
    unitAmount: price.unit_amount || 0,
    recurring: price.recurring
      ? {
          interval: price.recurring.interval,
          intervalCount: price.recurring.interval_count,
        }
      : undefined,
    metadata: price.metadata,
    created: price.created,
  });

  private mapStripeCustomer = (customer: Stripe.Customer): ICustomer => ({
    id: customer.id,
    email: customer.email || "",
    name: customer.name || undefined,
    metadata: customer.metadata,
    created: customer.created,
  });

  private mapStripeSubscription = (
    subscription: Stripe.Subscription,
  ): ISubscription => ({
    id: subscription.id,
    customerId:
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id,
    status: subscription.status as ISubscription["status"],
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    canceledAt: subscription.canceled_at || undefined,
    items: subscription.items.data.map((item) => ({
      id: item.id,
      priceId: typeof item.price === "string" ? item.price : item.price.id,
      quantity: item.quantity || 1,
    })),
    metadata: subscription.metadata,
    created: subscription.created,
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
    clientSecret: paymentIntent.client_secret || undefined,
    metadata: paymentIntent.metadata,
    created: paymentIntent.created,
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
    url: session.url || undefined,
    successUrl: session.success_url || undefined,
    cancelUrl: session.cancel_url || undefined,
    metadata: session.metadata || {},
    created: session.created,
  });

  private mapStripeWebhookEvent = (event: Stripe.Event): IWebhookEvent => ({
    id: event.id,
    type: event.type,
    data: event.data.object,
    created: event.created,
  });

  private mapStripeError = (error: unknown): IPaymentError => {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        code: error.code || "unknown",
        message: error.message,
        type: error.type,
        statusCode: error.statusCode,
      };
    }
    return {
      code: "unknown",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      type: "api_error",
    };
  };
}
