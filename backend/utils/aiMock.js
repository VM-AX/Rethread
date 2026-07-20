// Mock AI grading engine.
//
// This module deliberately isolates "the AI decision" behind a single
// function, `gradeListingImages`, so a real computer-vision / ML model can
// be swapped in later (e.g. call out to a hosted model or the Anthropic API
// with vision input) WITHOUT changing controllers, routes, or the DB schema.
//
// The mock uses deterministic-but-varied pseudo-randomness seeded from the
// image URLs + category, so repeated grading of the same listing is stable.

function seededRandom(seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function next() {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };
}

function scoreToConditionLabel(score) {
  if (score >= 85) return 'like-new';
  if (score >= 65) return 'gently-used';
  if (score >= 40) return 'visible-wear';
  return 'needs-repair';
}

function scoreToConfidence(score) {
  if (score >= 80) return 'high';
  if (score >= 55) return 'medium';
  return 'low';
}

const POSSIBLE_DEFECTS = [
  'Minor fabric pilling',
  'Faint discoloration near hem',
  'Loose thread on seam',
  'Small stitch coming undone',
  'Slight fading from wear',
  'Light scuff on hardware',
  'Zipper stiffness',
  'Button looseness',
];

function pickDefects(rand, conditionScore) {
  if (conditionScore >= 85) return [];
  // Worse condition -> more likely / more numerous defects.
  const count = conditionScore >= 65 ? 1 : conditionScore >= 40 ? 2 : 3;
  const pool = [...POSSIBLE_DEFECTS];
  const picked = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function suggestRepairFor(conditionLabel, defects) {
  if (conditionLabel === 'needs-repair') return 'Professional repair recommended before resale';
  if (defects.some((d) => /stitch|seam/i.test(d))) return 'Minor stitching touch-up recommended';
  if (defects.some((d) => /zipper|button|hardware/i.test(d))) return 'Hardware check/replacement recommended';
  if (conditionLabel === 'visible-wear') return 'Light cleaning or spot repair recommended';
  return null;
}

/**
 * @param {Object} params
 * @param {string[]} params.imageUrls
 * @param {string} params.category
 * @param {string} params.brand
 * @param {number} [params.originalPrice]
 * @returns {{conditionScore:number, authenticityScore:number, conditionLabel:string,
 *            authenticityConfidence:string, flaggedForReview:boolean, notes:string[],
 *            detectedDefects:string[], suggestedRepair:string|null,
 *            estimatedResalePrice:number|null}}
 */
function gradeListingImages({ imageUrls = [], category = '', brand = '', originalPrice = null }) {
  const seed = `${imageUrls.join('|')}::${category}::${brand}`;
  const rand = seededRandom(seed || 'default-seed');

  // Base scores skew reasonably high since most resale items are wearable.
  const conditionScore = Math.round(45 + rand() * 55); // 45 - 100
  const authenticityScore = Math.round(50 + rand() * 50); // 50 - 100

  const conditionLabel = scoreToConditionLabel(conditionScore);
  const authenticityConfidence = scoreToConfidence(authenticityScore);
  const detectedDefects = pickDefects(rand, conditionScore);
  const suggestedRepair = suggestRepairFor(conditionLabel, detectedDefects);

  // Resale price estimate: shrink from original price based on condition,
  // falling back to a condition-only multiplier when no original price is known.
  const conditionMultiplier = 0.35 + (conditionScore / 100) * 0.5; // 0.35 - 0.85
  const estimatedResalePrice = originalPrice
    ? Math.round(originalPrice * conditionMultiplier)
    : null;

  const notes = [];
  if (imageUrls.length < 2) {
    notes.push('Fewer than 2 images supplied — grading confidence reduced.');
  }
  if (!brand) {
    notes.push('No brand specified — authenticity check relies on visual cues only.');
  }
  if (conditionLabel === 'needs-repair') {
    notes.push('Visible damage detected — consider booking a repair before listing.');
  }

  const flaggedForReview = authenticityScore < 55 || conditionScore < 35;
  if (flaggedForReview) {
    notes.push('Flagged for manual admin review due to low confidence score.');
  }

  return {
    conditionScore,
    authenticityScore,
    conditionLabel,
    authenticityConfidence,
    flaggedForReview,
    notes,
    detectedDefects,
    suggestedRepair,
    estimatedResalePrice,
    imagesAnalyzed: imageUrls.length,
  };
}

module.exports = { gradeListingImages };
