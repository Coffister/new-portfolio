export interface EstimateOption {
  label: string;
  price: [number, number];
  weeks: [number, number];
}

export interface EstimateMultiplierOption {
  label: string;
  priceMultiplier: number;
  weeksMultiplier: number;
}

export interface EstimateBudgetOption {
  label: string;
  price: [number, number];
}

export const entityOptions: EstimateOption[] = [
  { label: "novú značku", price: [200, 500], weeks: [2, 3] },
  { label: "existujúcu firmu", price: [300, 700], weeks: [2, 4] },
  { label: "osobnú značku", price: [150, 400], weeks: [1, 3] },
  { label: "e-shop", price: [500, 1200], weeks: [4, 6] },
  { label: "neziskový projekt", price: [100, 300], weeks: [1, 2] },
  { label: "iné", price: [200, 500], weeks: [2, 3] },
];

export const serviceOptions: EstimateOption[] = [
  { label: "brandingom", price: [300, 900], weeks: [2, 4] },
  { label: "webdizajnom", price: [500, 1500], weeks: [3, 6] },
  { label: "marketingovými materiálmi", price: [150, 500], weeks: [1, 2] },
  { label: "kompletnou identitou", price: [800, 2000], weeks: [5, 8] },
  { label: "iné", price: [200, 600], weeks: [2, 3] },
];

export const scopeOptions: EstimateMultiplierOption[] = [
  { label: "jednoduchý", priceMultiplier: 0.7, weeksMultiplier: 0.75 },
  { label: "stredne komplexný", priceMultiplier: 1, weeksMultiplier: 1 },
  { label: "komplexný", priceMultiplier: 1.5, weeksMultiplier: 1.4 },
];

export const budgetOptions: EstimateBudgetOption[] = [
  { label: "do 500 €", price: [200, 500] },
  { label: "500 – 1000 €", price: [500, 1000] },
  { label: "1000 – 2000 €", price: [1000, 2000] },
  { label: "2000 – 5000 €", price: [2000, 5000] },
  { label: "nad 5000 €", price: [5000, 8000] },
];

export const timelineOptions: EstimateMultiplierOption[] = [
  { label: "čo najskôr", priceMultiplier: 1.15, weeksMultiplier: 0.6 },
  { label: "počas najbližšieho mesiaca", priceMultiplier: 1, weeksMultiplier: 1 },
  { label: "v priebehu 2–3 mesiacov", priceMultiplier: 0.95, weeksMultiplier: 1.5 },
  { label: "keď to bude možné", priceMultiplier: 0.9, weeksMultiplier: 1.8 },
];

export interface EstimateSelections {
  entity: number;
  service: number[];
  scope: number;
  budget: number;
  timeline: number;
}

export const defaultSelections: EstimateSelections = {
  entity: 2,
  service: [0],
  scope: 1,
  budget: 2,
  timeline: 1,
};

export interface EstimateResult {
  priceMin: number;
  priceMax: number;
  weeksMin: number;
  weeksMax: number;
}

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export function calculateEstimate(selections: EstimateSelections): EstimateResult {
  const entity = entityOptions[selections.entity];
  const services = selections.service.length > 0
    ? selections.service.map((index) => serviceOptions[index])
    : [serviceOptions[0]];
  const scope = scopeOptions[selections.scope];
  const budget = budgetOptions[selections.budget];
  const timeline = timelineOptions[selections.timeline];

  // combining multiple services adds up both the price and the time needed
  const servicePriceMin = services.reduce((sum, service) => sum + service.price[0], 0);
  const servicePriceMax = services.reduce((sum, service) => sum + service.price[1], 0);
  const serviceWeeksMin = services.reduce((sum, service) => sum + service.weeks[0], 0);
  const serviceWeeksMax = services.reduce((sum, service) => sum + service.weeks[1], 0);

  const basePriceMin = (entity.price[0] + servicePriceMin) * scope.priceMultiplier;
  const basePriceMax = (entity.price[1] + servicePriceMax) * scope.priceMultiplier;

  // blend the calculated need with the client's stated budget expectation
  const blendedMin = basePriceMin * 0.6 + budget.price[0] * 0.4;
  const blendedMax = basePriceMax * 0.6 + budget.price[1] * 0.4;

  const priceMin = Math.max(100, roundTo(blendedMin * timeline.priceMultiplier, 50));
  const priceMax = Math.max(priceMin + 100, roundTo(blendedMax * timeline.priceMultiplier, 50));

  const baseWeeksMin = (entity.weeks[0] + serviceWeeksMin) * scope.weeksMultiplier;
  const baseWeeksMax = (entity.weeks[1] + serviceWeeksMax) * scope.weeksMultiplier;

  const weeksMin = Math.max(1, Math.round(baseWeeksMin * timeline.weeksMultiplier));
  const weeksMax = Math.max(weeksMin + 1, Math.round(baseWeeksMax * timeline.weeksMultiplier));

  return { priceMin, priceMax, weeksMin, weeksMax };
}

export function formatPrice(min: number, max: number): string {
  const format = (value: number) => value.toLocaleString("sk-SK");
  return `${format(min)}–${format(max)}€`;
}

function pluralize(count: number, forms: [string, string, string]): string {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}

function formatSingleDuration(weeks: number): string {
  if (weeks < 4) {
    return `${weeks} ${pluralize(weeks, ["týždeň", "týždne", "týždňov"])}`;
  }

  const months = Math.max(1, Math.round(weeks / 4));
  return `${months} ${pluralize(months, ["mesiac", "mesiace", "mesiacov"])}`;
}

export function formatDuration(weeksMin: number, weeksMax: number): string {
  const minLabel = formatSingleDuration(weeksMin);
  const maxLabel = formatSingleDuration(weeksMax);

  return minLabel === maxLabel ? minLabel : `${minLabel} – ${maxLabel}`;
}
