// Product Operations
// Single Responsibility: Handle products and prices

import type Stripe from "stripe";

import type { IProduct, IPrice } from "@/shared/types/payments";

export class ProductOperations {
  constructor(private stripe: Stripe) {}

  async getProducts(
    mapProduct: (product: Stripe.Product) => IProduct,
    mapError: (error: unknown) => Error,
  ): Promise<IProduct[]> {
    try {
      const { data } = await this.stripe.products.list({
        active: true,
        expand: ["data.default_price"],
      });

      return data.map(mapProduct);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getProduct(
    productId: string,
    mapProduct: (product: Stripe.Product) => IProduct,
    mapError: (error: unknown) => Error,
  ): Promise<IProduct | null> {
    try {
      const product = await this.stripe.products.retrieve(productId);
      return mapProduct(product);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }

  async getPrices(
    productId: string | undefined,
    mapPrice: (price: Stripe.Price) => IPrice,
    mapError: (error: unknown) => Error,
  ): Promise<IPrice[]> {
    try {
      const params: Stripe.PriceListParams = {
        active: true,
        expand: ["data.product"],
      };

      if (productId) {
        params.product = productId;
      }

      const { data } = await this.stripe.prices.list(params);
      return data.map(mapPrice);
    } catch (error) {
      throw mapError(error);
    }
  }

  async getPrice(
    priceId: string,
    mapPrice: (price: Stripe.Price) => IPrice,
    mapError: (error: unknown) => Error,
  ): Promise<IPrice | null> {
    try {
      const price = await this.stripe.prices.retrieve(priceId);
      return mapPrice(price);
    } catch (error) {
      if ((error as Stripe.StripeRawError).code === "resource_missing") {
        return null;
      }
      throw mapError(error);
    }
  }
}
