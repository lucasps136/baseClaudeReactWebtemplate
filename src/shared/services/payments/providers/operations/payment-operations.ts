// Payment Operations
// Single Responsibility: Handle payment intents

import type Stripe from "stripe";

import type {
  IPaymentIntent,
  ICreatePaymentIntentOptions,
} from "@/shared/types/payments";

export class PaymentOperations {
  constructor(private stripe: Stripe) {}

  async createPaymentIntent(
    options: ICreatePaymentIntentOptions,
    mapPaymentIntent: (paymentIntent: Stripe.PaymentIntent) => IPaymentIntent,
    mapError: (error: unknown) => Error,
  ): Promise<IPaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: options.amount,
        currency: options.currency,
        customer: options.customerId,
        metadata: options.metadata,
        automatic_payment_methods: options.automaticPaymentMethods,
      });

      return mapPaymentIntent(paymentIntent);
    } catch (error) {
      throw mapError(error);
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    mapPaymentIntent: (paymentIntent: Stripe.PaymentIntent) => IPaymentIntent,
    mapError: (error: unknown) => Error,
  ): Promise<IPaymentIntent> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.confirm(paymentIntentId);
      return mapPaymentIntent(paymentIntent);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getPaymentIntent(
    paymentIntentId: string,
    mapPaymentIntent: (paymentIntent: Stripe.PaymentIntent) => IPaymentIntent,
    mapError: (error: unknown) => Error,
  ): Promise<IPaymentIntent | null> {
    try {
      const paymentIntent =
        await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return mapPaymentIntent(paymentIntent);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }
}
