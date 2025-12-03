// Customer Operations
// Single Responsibility: Handle customer management

import type Stripe from "stripe";

import type { ICustomer } from "@/shared/types/payments";

export class CustomerOperations {
  constructor(private stripe: Stripe) {}

  async createCustomer(
    data: Omit<ICustomer, "id" | "stripeCustomerId">,
    mapCustomer: (customer: Stripe.Customer) => ICustomer,
    mapError: (error: unknown) => Error,
  ): Promise<ICustomer> {
    try {
      const customer = await this.stripe.customers.create({
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      return mapCustomer(customer);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getCustomer(
    customerId: string,
    mapCustomer: (customer: Stripe.Customer) => ICustomer,
    mapError: (error: unknown) => Error,
  ): Promise<ICustomer | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        return null;
      }

      return mapCustomer(customer as Stripe.Customer);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }

  async updateCustomer(
    customerId: string,
    data: Partial<ICustomer>,
    mapCustomer: (customer: Stripe.Customer) => ICustomer,
    mapError: (error: unknown) => Error,
  ): Promise<ICustomer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      return mapCustomer(customer);
    } catch (error) {
      throw mapError(error);
    }
  }

  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string,
    mapError: (error: unknown) => Error,
  ): Promise<{ url: string }> {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (error) {
      throw mapError(error);
    }
  }
}
