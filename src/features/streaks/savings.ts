export type SmokingCost = {
  cigarettesPerDay: number;
  packPrice: number;
  packSize: number;
};

/** Cigarettes not smoked over `days` smoke-free days. */
export function cigarettesAvoided(days: number, cost: Pick<SmokingCost, "cigarettesPerDay">): number {
  return Math.max(0, days) * cost.cigarettesPerDay;
}

/** Money not spent on cigarettes over `days` smoke-free days. */
export function moneySaved(days: number, cost: SmokingCost): number {
  return (cigarettesAvoided(days, cost) / cost.packSize) * cost.packPrice;
}

export const euros = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
