// Helper to select real high-quality clothing/fashion images matching item title & category

const CLOTHING_IMAGE_POOLS = {
  skirt: [
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
  ],
  denim: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
  ],
  tops: [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
  ],
  dresses: [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
  ],
  outerwear: [
    'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
  ],
  footwear: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  ],
  'ethnic-wear': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
  ],
  bottoms: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80',
  ],
};

function getClothingImage(title = '', category = 'tops', index = 0) {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  let pool = CLOTHING_IMAGE_POOLS.tops;

  if (lowerTitle.includes('skirt')) {
    pool = CLOTHING_IMAGE_POOLS.skirt;
  } else if (lowerTitle.includes('jean') || lowerTitle.includes('denim')) {
    pool = CLOTHING_IMAGE_POOLS.denim;
  } else if (lowerTitle.includes('jacket') || lowerTitle.includes('coat') || lowerTitle.includes('blazer') || lowerTitle.includes('cardigan')) {
    pool = CLOTHING_IMAGE_POOLS.outerwear;
  } else if (lowerTitle.includes('dress') || lowerTitle.includes('frock') || lowerTitle.includes('gown')) {
    pool = CLOTHING_IMAGE_POOLS.dresses;
  } else if (lowerTitle.includes('shoe') || lowerTitle.includes('sneaker') || lowerTitle.includes('boot') || lowerTitle.includes('heel') || lowerTitle.includes('footwear')) {
    pool = CLOTHING_IMAGE_POOLS.footwear;
  } else if (lowerTitle.includes('bag') || lowerTitle.includes('watch') || lowerTitle.includes('sunglasses') || lowerTitle.includes('accessory')) {
    pool = CLOTHING_IMAGE_POOLS.accessories;
  } else if (lowerTitle.includes('saree') || lowerTitle.includes('kurti') || lowerTitle.includes('ethnic')) {
    pool = CLOTHING_IMAGE_POOLS['ethnic-wear'];
  } else if (CLOTHING_IMAGE_POOLS[lowerCategory]) {
    pool = CLOTHING_IMAGE_POOLS[lowerCategory];
  }

  const selectedUrl = pool[index % pool.length];
  return selectedUrl;
}

function dicebearAvatar(seed, style = 'adventurer') {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

function dicebearLogo(seed) {
  return `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(seed)}`;
}

function placeholderPhoto(width = 600, height = 800, label = '') {
  const text = label ? `?text=${encodeURIComponent(label)}` : '';
  return `https://placehold.co/${width}x${height}${text}`;
}

function shopBanner(seed) {
  return getClothingImage('shop-banner', 'outerwear', 0);
}

function productImages(seed, category = 'tops', title = '', count = 4) {
  return Array.from({ length: count }, (_, i) => ({
    url: getClothingImage(title || seed, category, i),
    publicId: `clothing-${seed}-${i}`,
  }));
}

module.exports = {
  dicebearAvatar,
  dicebearLogo,
  placeholderPhoto,
  shopBanner,
  productImages,
  getClothingImage,
  CLOTHING_IMAGE_POOLS,
};
