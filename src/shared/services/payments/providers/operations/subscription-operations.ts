// Subscription Operations
// Single Responsibility: Handle subscriptions

import type Stripe from "stripe";

import type {
  ISubscription,
  ICreateSubscriptionOptions,
} from "@/shared/types/payments";

interface ICreateSubscriptionParams {
  options: ICreateSubscriptionOptions;
  mapSubscription: (subscription: Stripe.Subscription) => ISubscription;
  mapError: (error: unknown) => Error;
}

export class SubscriptionOperations {
  constructor(private stripe: Stripe) {}

  async createSubscription(
    customerId: string,
    priceId: string,
    params: ICreateSubscriptionParams,
  ): Promise<ISubscription> {
    const { options, mapSubscription, mapError } = params;
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: options.trialPeriodDays,
        metadata: options.metadata,
        payment_behavior: options.paymentBehavior || "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      return mapSubscription(subscription);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getSubscription(
    subscriptionId: string,
    mapSubscription: (subscription: Stripe.Subscription) => ISubscription,
    mapError: (error: unknown) => Error,
  ): Promise<ISubscription | null> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      return mapSubscription(subscription);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }

  async updateSubscription(
    subscriptionId: string,
    data: Partial<ISubscription>,
    mapSubscription: (subscription: Stripe.Subscription) => ISubscription,
    mapError: (error: unknown) => Error,
  ): Promise<ISubscription> {
    try {
      const updateData: Stripe.SubscriptionUpdateParams = {};

      if (data.priceId) {
        const subscription =
          await this.stripe.subscriptions.retrieve(subscriptionId);
        updateData.items = [
          {
            id: subscription.items.data[0].id,
            price: data.priceId,
          },
        ];
      }

      if (data.metadata) {
        updateData.metadata = data.metadata;
      }

      const subscription = await this.stripe.subscriptions.update(
        subscriptionId,
        updateData,
      );
      return mapSubscription(subscription);
    } catch (error) {
      throw mapError(error);
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean,
    mapSubscription: (subscription: Stripe.Subscription) => ISubscription,
    mapError: (error: unknown) => Error,
  ): Promise<ISubscription> {
    try {
      let subscription: Stripe.Subscription;

      if (cancelAtPeriodEnd) {
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      }

      return mapSubscription(subscription);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getCustomerSubscriptions(
    customerId: string,
    mapSubscription: (subscription: Stripe.Subscription) => ISubscription,
    mapError: (error: unknown) => Error,
  ): Promise<ISubscription[]> {
    try {
      const { data } = await this.stripe.subscriptions.list({
        customer: customerId,
        status: "all",
      });

      return data.map(mapSubscription);
    } catch (error) {
      throw mapError(error);
    }
  }
}
