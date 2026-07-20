// Predefined, category-level sustainability estimates.
// Values are simplified averages (liters of water saved, kg CO2e avoided)
// versus producing an equivalent NEW garment. Intentionally simple &
// explainable rather than a full lifecycle-assessment calculation.
const IMPACT_TABLE = {
  tops: { waterSavedLiters: 2000, co2SavedKg: 5, textileWasteDivertedKg: 0.3 },
  bottoms: { waterSavedLiters: 3500, co2SavedKg: 8, textileWasteDivertedKg: 0.6 },
  dresses: { waterSavedLiters: 3000, co2SavedKg: 7, textileWasteDivertedKg: 0.5 },
  outerwear: { waterSavedLiters: 5000, co2SavedKg: 12, textileWasteDivertedKg: 1.1 },
  footwear: { waterSavedLiters: 4000, co2SavedKg: 10, textileWasteDivertedKg: 0.8 },
  accessories: { waterSavedLiters: 800, co2SavedKg: 2, textileWasteDivertedKg: 0.15 },
  denim: { waterSavedLiters: 7000, co2SavedKg: 15, textileWasteDivertedKg: 0.9 },
  'ethnic-wear': { waterSavedLiters: 4500, co2SavedKg: 9, textileWasteDivertedKg: 0.7 },
};

const DEFAULT_IMPACT = { waterSavedLiters: 1500, co2SavedKg: 4, textileWasteDivertedKg: 0.3 };

function getImpactForCategory(category) {
  return IMPACT_TABLE[category] || DEFAULT_IMPACT;
}

function calculateImpactForItems(items) {
  // items: [{ category, quantity }]
  return items.reduce(
    (acc, item) => {
      const impact = getImpactForCategory(item.category);
      const qty = item.quantity || 1;
      acc.totalWaterSavedLiters += impact.waterSavedLiters * qty;
      acc.totalCo2SavedKg += impact.co2SavedKg * qty;
      acc.totalTextileWasteDivertedKg += impact.textileWasteDivertedKg * qty;
      return acc;
    },
    { totalWaterSavedLiters: 0, totalCo2SavedKg: 0, totalTextileWasteDivertedKg: 0 }
  );
}

// Converts a raw water+co2 impact score into a friendly A-E letter grade,
// used on listing cards and the product detail page.
function getSustainabilityRating({ waterSavedLiters = 0, co2SavedKg = 0 }) {
  const score = waterSavedLiters / 1000 + co2SavedKg; // simple weighted blend
  if (score >= 20) return 'A';
  if (score >= 12) return 'B';
  if (score >= 7) return 'C';
  if (score >= 3) return 'D';
  return 'E';
}

module.exports = {
  IMPACT_TABLE,
  DEFAULT_IMPACT,
  getImpactForCategory,
  calculateImpactForItems,
  getSustainabilityRating,
};
