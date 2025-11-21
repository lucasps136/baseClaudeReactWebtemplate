// Payment types inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Adapted with SOLID principles for our template

export interface IPrice {
  id: string;
  productId: string;
  active: boolean;
  currency: string;
  unitAmount: number;
  interval?: "month" | "year";
  intervalCount?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface IProduct {
  id: string;
  active: boolean;
  name: string;
  description?: string;
  image?: string;
  metadata?: Record<string, string>;
}

export interface ISubscription {
  id: string;
  userId: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  priceId: string;
  customerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelAt?: Date;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: Record<string, string>;
}

export interface ICustomer {
  id: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface IPaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";
  clientSecret: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface ICheckoutSession {
  id: string;
  url: string;
  customerId?: string;
  subscriptionId?: string;
  mode: "payment" | "subscription" | "setup";
  status: "open" | "complete" | "expired";
}

export interface IWebhookEvent {
  id: string;
  type: string;
  data: any;
  created: Date;
  processed: boolean;
}

// Main payment provider interface (DIP)
export interface IPaymentProvider {
  // Products and Prices
  getProducts(): Promise<IProduct[]>;
  getProduct(productId: string): Promise<IProduct | null>;
  getPrices(productId?: string): Promise<IPrice[]>;
  getPrice(priceId: string): Promise<IPrice | null>;

  // Customers
  createCustomer(
    data: Omit<ICustomer, "id" | "stripeCustomerId">,
  ): Promise<ICustomer>;
  getCustomer(customerId: string): Promise<ICustomer | null>;
  updateCustomer(
    customerId: string,
    data: Partial<ICustomer>,
  ): Promise<ICustomer>;

  // Subscriptions
  createSubscription(
    customerId: string,
    priceId: string,
    options?: ICreateSubscriptionOptions,
  ): Promise<ISubscription>;
  getSubscription(subscriptionId: string): Promise<ISubscription | null>;
  updateSubscription(
    subscriptionId: string,
    data: Partial<ISubscription>,
  ): Promise<ISubscription>;
  cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd?: boolean,
  ): Promise<ISubscription>;
  getCustomerSubscriptions(customerId: string): Promise<ISubscription[]>;

  // Checkout
  createCheckoutSession(
    options: ICreateCheckoutSessionOptions,
  ): Promise<ICheckoutSession>;
  getCheckoutSession(sessionId: string): Promise<ICheckoutSession | null>;

  // Payment Intents
  createPaymentIntent(
    options: ICreatePaymentIntentOptions,
  ): Promise<IPaymentIntent>;
  confirmPaymentIntent(paymentIntentId: string): Promise<IPaymentIntent>;
  getPaymentIntent(paymentIntentId: string): Promise<IPaymentIntent | null>;

  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean;
  processWebhookEvent(event: any): Promise<IWebhookEvent>;

  // ICustomer Portal
  createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
  ): Promise<{ url: string }>;

  // Initialization
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Configuration options
export interface ICreateSubscriptionOptions {
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
  paymentBehavior?:
    | "default_incomplete"
    | "pending_if_incomplete"
    | "error_if_incomplete";
}

export interface ICreateCheckoutSessionOptions {
  mode: "payment" | "subscription" | "setup";
  lineItems: Array<{
    priceId: string;
    quantity?: number;
  }>;
  customerId?: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  allowPromotionCodes?: boolean;
  billingAddressCollection?: "auto" | "required";
  trialPeriodDays?: number;
}

export interface ICreatePaymentIntentOptions {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
  automaticPaymentMethods?: {
    enabled: boolean;
  };
}

// Strategy Pattern for different payment providers
export type PaymentProviderType = "stripe" | "paddle" | "lemonsqueezy";

export interface IPaymentProviderConfig {
  type: PaymentProviderType;
  options: Record<string, any>;
}

// Error types
export interface IPaymentError {
  code: string;
  message: string;
  type:
    | "api_error"
    | "card_error"
    | "idempotency_error"
    | "invalid_request_error"
    | "rate_limit_error";
  details?: any;
}

// Response wrapper
export interface IPaymentResponse<T = any> {
  data: T | null;
  error: IPaymentError | null;
}

// Webhook event types
export type StripeWebhookEvent =
  | "customer.subscription.created"
  | "customer.subscription.updated"
  | "customer.subscription.deleted"
  | "invoice.payment_succeeded"
  | "invoice.payment_failed"
  | "checkout.session.completed"
  | "customer.created"
  | "customer.updated"
  | "customer.deleted";

// ISubscription status helpers
export const ACTIVE_SUBSCRIPTION_STATUSES: ISubscription["status"][] = [
  "active",
  "trialing",
];
export const INACTIVE_SUBSCRIPTION_STATUSES: ISubscription["status"][] = [
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
];

// Utility functions
export const isSubscriptionActive = (subscription: ISubscription): boolean => {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);
};

export const isSubscriptionCanceled = (
  subscription: ISubscription,
): boolean => {
  return subscription.status === "canceled" || subscription.cancelAtPeriodEnd;
};
