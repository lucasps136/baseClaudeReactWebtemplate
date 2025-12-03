// Webhook Operations
// Single Responsibility: Handle webhook verification and processing

import type Stripe from "stripe";

import type { IWebhookEvent } from "@/shared/types/payments";

export class WebhookOperations {
  constructor(
    private stripe: Stripe,
    private webhookSecret?: string,
  ) {}

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async processWebhookEvent(
    event: {
      id: string;
      type: string;
      data: Record<string, unknown>;
      created: number;
    },
    mapError: (error: unknown) => Error,
  ): Promise<IWebhookEvent> {
    try {
      // Process different event types
      const webhookEvent: IWebhookEvent = {
        id: event.id,
        type: event.type,
        data: event.data,
        created: new Date(event.created * 1000),
        processed: true,
      };

      // Handle specific event types (Strategy Pattern could be applied here)
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          // Handle subscription events
          break;
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
          // Handle payment events
          break;
        case "checkout.session.completed":
          // Handle checkout completion
          break;
      }

      return webhookEvent;
    } catch (error) {
      throw mapError(error);
    }
  }
}
