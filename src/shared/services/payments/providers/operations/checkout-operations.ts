// Checkout Operations
// Single Responsibility: Handle checkout sessions

import type Stripe from "stripe";

import type {
  ICheckoutSession,
  ICreateCheckoutSessionOptions,
} from "@/shared/types/payments";

export class CheckoutOperations {
  constructor(private stripe: Stripe) {}

  async createCheckoutSession(
    options: ICreateCheckoutSessionOptions,
    mapCheckoutSession: (session: Stripe.Checkout.Session) => ICheckoutSession,
    mapError: (error: unknown) => Error,
  ): Promise<ICheckoutSession> {
    try {
      const sessionData: Stripe.Checkout.SessionCreateParams = {
        mode: options.mode,
        line_items: options.lineItems.map((item) => ({
          price: item.priceId,
          quantity: item.quantity || 1,
        })),
        success_url: options.successUrl,
        cancel_url: options.cancelUrl,
        metadata: options.metadata,
        allow_promotion_codes: options.allowPromotionCodes,
        billing_address_collection: options.billingAddressCollection,
      };

      if (options.customerId) {
        sessionData.customer = options.customerId;
      } else if (options.customerEmail) {
        sessionData.customer_email = options.customerEmail;
      }

      if (options.mode === "subscription" && options.trialPeriodDays) {
        sessionData.subscription_data = {
          trial_period_days: options.trialPeriodDays,
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionData);
      return mapCheckoutSession(session);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getCheckoutSession(
    sessionId: string,
    mapCheckoutSession: (session: Stripe.Checkout.Session) => ICheckoutSession,
    mapError: (error: unknown) => Error,
  ): Promise<ICheckoutSession | null> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return mapCheckoutSession(session);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }
}
