import { getProduct } from "../../src/data/products";

export type OrderItem = { slug: string; name: string; size: string; qty: number; price: number };

const MAX_LINES = 20;
const MAX_QTY = 10;

// Builds the order from the shop's own catalogue. Only slug, size and quantity
// come from the browser; names and prices are looked up here, so a tampered
// bag can't change what the customer is charged.
export function priceOrder(lines: unknown): { items: OrderItem[]; amount: number } | { error: string } {
  if (!Array.isArray(lines) || lines.length === 0) return { error: "Your bag is empty." };
  if (lines.length > MAX_LINES) return { error: "That's too many lines for one order." };

  const items: OrderItem[] = [];
  for (const line of lines) {
    const { slug, size, qty } = (line ?? {}) as Record<string, unknown>;
    const product = typeof slug === "string" ? getProduct(slug) : undefined;
    if (!product) return { error: "Something in your bag is no longer in the shop." };
    const option = product.sizes.find((s) => s.label === size);
    if (!option) return { error: `Pick a size for ${product.name}.` };
    if (!option.inStock) return { error: `${product.name} is sold out in ${option.label}.` };
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { error: `Check the quantity for ${product.name}.` };
    }
    items.push({ slug: product.slug, name: product.name, size: option.label, qty, price: product.price });
  }
  const amount = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return { items, amount };
}
