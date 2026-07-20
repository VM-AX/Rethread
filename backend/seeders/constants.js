// Display categories from the spec, mapped onto the existing Listing.category
// enum (tops/bottoms/dresses/outerwear/footwear/accessories/denim/ethnic-wear)
// so we don't have to touch the schema or the impact-data table.
const DISPLAY_CATEGORIES = [
  { label: 'Shirts', enumCategory: 'tops', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'T-Shirts', enumCategory: 'tops', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Hoodies', enumCategory: 'tops', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Jeans', enumCategory: 'denim', sizes: ['28', '30', '32', '34', '36', '38'] },
  { label: 'Sneakers', enumCategory: 'footwear', sizes: ['6', '7', '8', '9', '10', '11'] },
  { label: 'Jackets', enumCategory: 'outerwear', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Dresses', enumCategory: 'dresses', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
  { label: 'Accessories', enumCategory: 'accessories', sizes: ['One Size'] },
  { label: 'Winter Wear', enumCategory: 'outerwear', sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'Ethnic Wear', enumCategory: 'ethnic-wear', sizes: ['XS', 'S', 'M', 'L', 'XL'] },
];

const BRANDS = [
  'Nike', 'Adidas', 'Puma', "Levi's", 'H&M', 'Zara', 'Uniqlo',
  'Roadster', 'Allen Solly', 'Tommy Hilfiger', 'US Polo',
];

const COLORS = ['Black', 'White', 'Navy', 'Grey', 'Beige', 'Olive', 'Maroon', 'Denim Blue', 'Mustard', 'Rust'];

const GENDERS = ['men', 'women', 'unisex', 'kids'];

const CONDITION_LABELS = ['like-new', 'gently-used', 'visible-wear', 'needs-repair'];

const PRODUCT_ADJECTIVES = ['Classic', 'Vintage', 'Relaxed-Fit', 'Slim-Fit', 'Oversized', 'Everyday', 'Signature', 'Premium'];

function buildProductTitle(displayCategory, brand, color) {
  const adj = PRODUCT_ADJECTIVES[Math.floor(Math.random() * PRODUCT_ADJECTIVES.length)];
  return `${brand} ${adj} ${color} ${displayCategory}`.replace(/\s+/g, ' ').trim();
}

function buildProductDescription(displayCategory, brand, condition) {
  const conditionText = {
    'like-new': 'barely worn and looks practically new',
    'gently-used': 'gently worn with no major flaws',
    'visible-wear': 'shows some visible signs of wear consistent with regular use',
    'needs-repair': 'has a minor repairable issue, priced accordingly',
  }[condition];
  return `Pre-loved ${brand} ${displayCategory.toLowerCase()} — ${conditionText}. Smoke-free home, freshly cleaned before shipping. Great way to shop sustainably without compromising on style.`;
}

module.exports = { DISPLAY_CATEGORIES, BRANDS, COLORS, GENDERS, CONDITION_LABELS, buildProductTitle, buildProductDescription };
