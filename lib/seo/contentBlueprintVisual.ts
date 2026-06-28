/**
 * AS SIDRAT - SEO CONTENT BLUEPRINT VISUAL REFERENCE
 * Quick-lookup guide for exact heading structures and keywords
 * Copy-paste ready examples
 */

// ============================================================================
// HOMEPAGE - EXACT STRUCTURE TO USE
// ============================================================================

export const HOMEPAGE_EXACT_STRUCTURE = {
  title: "AS SIDRAT | Minimalist Premium Breathable Fashion for Bangladesh",
  
  metaDescription: 
    "Shop minimalist, breathable premium fashion designed for the South Asian climate. " +
    "Ethically-made linen and cotton clothing for men and women. Free delivery in Dhaka.",
  
  structure: [
    {
      level: "H1",
      text: "Premium Minimalist Breathable Fashion for the South Asian Climate",
      placement: "Hero section (immediately after hero image)",
      keywords: ["minimalist fashion", "breathable", "South Asian climate"],
      bengali: "দক্ষিণ এশীয় আবহাওয়ার জন্য প্রিমিয়াম মিনিমালিস্ট পোশাক",
    },
    
    {
      level: "H2",
      text: "Why Choose Minimalist Fashion",
      placement: "Features section",
      keywords: ["minimalist fashion", "quality", "sustainability"],
      children: [
        {
          level: "H3",
          text: "Premium Quality with Affordable Pricing",
          keywords: ["premium quality", "affordable"],
        },
        {
          level: "H3",
          text: "Breathable Fabrics for Hot Weather",
          keywords: ["breathable fabrics", "hot weather"],
        },
        {
          level: "H3",
          text: "Sustainable & Ethical Production",
          keywords: ["sustainable", "ethical production"],
        },
        {
          level: "H3",
          text: "Versatile Pieces for Any Occasion",
          keywords: ["versatile clothing", "minimalist"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Explore Our Collections",
      placement: "Collections preview section",
      keywords: ["shop", "collections", "browse"],
      children: [
        {
          level: "H3",
          text: "Men's Minimalist Wear",
          link: "/category/men",
          keywords: ["men's fashion", "minimalist"],
        },
        {
          level: "H3",
          text: "Women's Ethnic Fusion",
          link: "/category/women",
          keywords: ["women's fashion", "ethnic wear"],
        },
        {
          level: "H3",
          text: "Fusion Collections",
          link: "/category/fusion",
          keywords: ["fusion fashion", "contemporary"],
        },
        {
          level: "H3",
          text: "Accessories & Essentials",
          link: "/category/accessories",
          keywords: ["accessories", "minimalist"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "What Makes AS SIDRAT Different",
      placement: "Brand differentiation section",
      keywords: ["AS SIDRAT", "why choose", "premium"],
      children: [
        {
          level: "H3",
          text: "Climate-Conscious Design",
          keywords: ["climate", "conscious design"],
        },
        {
          level: "H3",
          text: "Ethical Manufacturing",
          keywords: ["ethical", "manufacturing", "fair trade"],
        },
        {
          level: "H3",
          text: "Premium Affordability",
          keywords: ["premium", "affordable", "value"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Why Minimalism Matters",
      placement: "Lifestyle/philosophy section",
      keywords: ["minimalism", "lifestyle", "sustainability"],
      children: [
        {
          level: "H3",
          text: "Build a Versatile Wardrobe",
          keywords: ["capsule wardrobe", "versatile"],
        },
        {
          level: "H3",
          text: "Quality That Lasts",
          keywords: ["durability", "quality", "longevity"],
        },
        {
          level: "H3",
          text: "Sustainable Fashion Choices",
          keywords: ["sustainability", "eco-friendly"],
        },
        {
          level: "H3",
          text: "Perfect for Hot Climates",
          keywords: ["hot weather", "breathable", "South Asia"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Join Our Community of Conscious Consumers",
      placement: "Newsletter/engagement section",
      keywords: ["community", "conscious", "newsletter"],
    },
  ],

  internalLinks: [
    { text: "men's minimalist wear", url: "/category/men" },
    { text: "women's ethnic fusion", url: "/category/women" },
    { text: "fusion collections", url: "/category/fusion" },
    { text: "premium linen shirts", url: "/product/classic-linen-shirt" },
    { text: "size guide", url: "/help/size-guide" },
    { text: "delivery information", url: "/help/shipping" },
  ],

  schemaMarkup: {
    type: "Organization",
    name: "AS SIDRAT",
    url: "https://assidrat.com",
    logo: "https://assidrat.com/logo.png",
  },
};

// ============================================================================
// MENS CATEGORY - EXACT STRUCTURE
// ============================================================================

export const MENS_CATEGORY_STRUCTURE = {
  title: "Men's Minimalist Fashion | Premium Linen Shirts Bangladesh",
  
  metaDescription:
    "Shop premium men's minimalist clothing - linen shirts, breathable casual wear, and " +
    "traditional panjabi designed for hot climates. Free delivery in Dhaka.",
  
  structure: [
    {
      level: "H1",
      text: "Men's Premium Minimalist Fashion | Breathable Linen Clothing",
      keywords: ["men's fashion", "minimalist", "linen shirts"],
      bengali: "পুরুষদের প্রিমিয়াম মিনিমালিস্ট ফ্যাশন | শ্বাসপ্রশ্বাসযোগ্য লিনেন পোশাক",
    },
    
    {
      level: "H2",
      text: "Premium Men's Linen Shirts for Every Season",
      keywords: ["men's linen shirts", "breathable", "premium"],
      children: [
        {
          level: "H3",
          text: "Casual Linen Shirts for Daily Wear",
          product: "classic-linen-shirt",
          keywords: ["casual", "linen", "daily wear"],
        },
        {
          level: "H3",
          text: "Breathable Panjabi for Formal Occasions",
          product: "indigo-panjabi",
          keywords: ["panjabi", "formal", "breathable"],
        },
        {
          level: "H3",
          text: "Office-Ready Minimalist Pieces",
          keywords: ["office wear", "minimalist", "professional"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Why Men Choose AS SIDRAT",
      keywords: ["why choose", "men's fashion", "quality"],
      children: [
        {
          level: "H3",
          text: "Quality That Lasts Through Seasons",
          keywords: ["durability", "quality", "longevity"],
        },
        {
          level: "H3",
          text: "Style Without Compromise",
          keywords: ["style", "fashion", "minimalist design"],
        },
        {
          level: "H3",
          text: "Comfort in Hot Weather",
          keywords: ["comfort", "breathable", "humidity"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "How to Style Minimalist Fashion",
      keywords: ["styling guide", "fashion tips", "wardrobe"],
      children: [
        {
          level: "H3",
          text: "Casual Day Styling Guide",
          keywords: ["casual styling", "everyday outfit"],
        },
        {
          level: "H3",
          text: "Office-to-Weekend Outfits",
          keywords: ["work outfit", "weekend fashion"],
        },
        {
          level: "H3",
          text: "Layering for Minimalists",
          keywords: ["layering", "capsule wardrobe"],
        },
        {
          level: "H3",
          text: "Color Coordination Tips",
          keywords: ["color matching", "wardrobe coordination"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Popular Men's Collections",
      keywords: ["shop", "collections", "products"],
      note: "This section shows actual product cards with H3 as product category headers",
      children: [
        {
          level: "H3",
          text: "Shop Classic Linen Shirts",
          link: "/category/men?sort=classic",
          keywords: ["classic shirts", "linen"],
        },
        {
          level: "H3",
          text: "Browse Traditional Panjabi",
          link: "/category/men?sort=panjabi",
          keywords: ["panjabi", "traditional"],
        },
        {
          level: "H3",
          text: "Explore Fusion Wear",
          link: "/category/fusion",
          keywords: ["fusion", "contemporary"],
        },
      ],
    },
  ],

  internalLinks: [
    { text: "men's minimalist wear", url: "/category/men" },
    { text: "breathable linen shirts", url: "/product/classic-linen-shirt" },
    { text: "premium panjabi", url: "/product/indigo-panjabi" },
    { text: "size guide", url: "/help/size-guide" },
    { text: "fabric care tips", url: "/help/fabric-care" },
    { text: "women's collection", url: "/category/women" },
    { text: "shop home page", url: "/" },
  ],

  filterFacets: [
    "Price: Under 2000 TK, 2000-3000 TK, 3000-4000 TK, 4000+ TK",
    "Material: Linen, Cotton, Linen-Cotton Blend",
    "Color: White, Navy, Indigo, Beige, Earth Tones",
    "Fit: Regular, Slim, Oversized",
    "Occasion: Casual, Formal, Office",
    "Availability: In Stock, On Sale",
  ],

  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { position: 1, name: "Home", item: "https://assidrat.com" },
      { position: 2, name: "Men's Fashion", item: "https://assidrat.com/category/men" },
    ],
  },
};

// ============================================================================
// WOMENS CATEGORY - EXACT STRUCTURE
// ============================================================================

export const WOMENS_CATEGORY_STRUCTURE = {
  title: "Women's Minimalist Fashion | Ethnic Fusion Wear Bangladesh",
  
  metaDescription:
    "Discover minimalist women's fashion - breathable ethnic fusion wear, traditional kameez, " +
    "and contemporary casual clothing designed for the South Asian climate.",
  
  structure: [
    {
      level: "H1",
      text: "Women's Minimalist Fashion | Breathable Ethnic Fusion Wear",
      keywords: ["women's fashion", "ethnic wear", "fusion"],
      bengali: "মহিলাদের মিনিমালিস্ট ফ্যাশন | শ্বাসপ্রশ্বাসযোগ্য এথনিক ফিউশন পোশাক",
    },
    
    {
      level: "H2",
      text: "Premium Women's Ethnic Fusion Collections",
      keywords: ["women's ethnic wear", "fusion", "premium"],
      children: [
        {
          level: "H3",
          text: "Modern Minimalist Kameez",
          keywords: ["kameez", "modern", "minimalist"],
        },
        {
          level: "H3",
          text: "Contemporary Fusion Dresses",
          keywords: ["fusion dresses", "contemporary"],
        },
        {
          level: "H3",
          text: "Breathable Traditional Wear",
          keywords: ["traditional wear", "breathable"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Why Women Love AS SIDRAT",
      keywords: ["women's fashion", "quality", "comfort"],
      children: [
        {
          level: "H3",
          text: "Breathable Comfort for Humid Weather",
          keywords: ["comfort", "breathable", "humidity"],
        },
        {
          level: "H3",
          text: "Versatile Pieces for Modern Life",
          keywords: ["versatile", "modern", "practical"],
        },
        {
          level: "H3",
          text: "Sustainable Fashion Choices",
          keywords: ["sustainable", "ethical", "eco-friendly"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Styling Your Minimalist Wardrobe",
      keywords: ["styling", "wardrobe", "fashion tips"],
      children: [
        {
          level: "H3",
          text: "Daily Wear Styling Ideas",
          keywords: ["daily outfit", "casual styling"],
        },
        {
          level: "H3",
          text: "Occasion-Ready Outfits",
          keywords: ["occasion wear", "special events"],
        },
        {
          level: "H3",
          text: "Layering & Accessorizing Tips",
          keywords: ["layering", "accessories", "coordination"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Shop by Occasion",
      keywords: ["shop", "occasion", "collections"],
      children: [
        {
          level: "H3",
          text: "Casual Weekend Wear",
          keywords: ["casual", "weekend", "everyday"],
        },
        {
          level: "H3",
          text: "Office-Appropriate Fashion",
          keywords: ["office wear", "professional", "formal"],
        },
        {
          level: "H3",
          text: "Festive Collections",
          keywords: ["festive", "party", "celebration"],
        },
      ],
    },
  ],

  internalLinks: [
    { text: "women's fusion dresses", url: "/product/fusion-dress" },
    { text: "traditional kameez", url: "/product/indigo-kameez" },
    { text: "size chart", url: "/help/size-guide" },
    { text: "fabric care guide", url: "/help/fabric-care" },
    { text: "return policy", url: "/help/returns" },
    { text: "men's collection", url: "/category/men" },
  ],

  filterFacets: [
    "Price range",
    "Color palette",
    "Material: Cotton, Linen, Silk-blend",
    "Style: Casual, Formal, Festive",
    "Size: XS, S, M, L, XL, XXL",
    "New Arrivals, Best Sellers, On Sale",
  ],
};

// ============================================================================
// FUSION CATEGORY - EXACT STRUCTURE
// ============================================================================

export const FUSION_CATEGORY_STRUCTURE = {
  title: "Fusion Fashion Collections | Contemporary Ethnic Wear Bangladesh",
  
  metaDescription:
    "Explore fusion fashion where tradition meets modern minimalism. Contemporary ethnic wear " +
    "designed for urban South Asian lifestyle.",
  
  structure: [
    {
      level: "H1",
      text: "Fusion Fashion | Where Tradition Meets Minimalism",
      keywords: ["fusion fashion", "contemporary ethnic", "modern"],
    },
    
    {
      level: "H2",
      text: "Contemporary Ethnic Fusion Wear",
      keywords: ["fusion wear", "contemporary", "ethnic"],
      children: [
        {
          level: "H3",
          text: "Modern Panjabi with Minimalist Design",
          keywords: ["panjabi", "modern", "minimalist"],
        },
        {
          level: "H3",
          text: "Fusion Dresses for Urban Lifestyle",
          keywords: ["fusion dresses", "urban fashion"],
        },
        {
          level: "H3",
          text: "East-Meets-West Fashion",
          keywords: ["east meets west", "cultural fusion"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Why Choose Fusion Fashion",
      keywords: ["fusion", "contemporary", "modern traditional"],
      children: [
        {
          level: "H3",
          text: "Express Your Cultural Identity",
          keywords: ["cultural", "identity", "tradition"],
        },
        {
          level: "H3",
          text: "Versatility for Every Occasion",
          keywords: ["versatile", "multi-occasion"],
        },
        {
          level: "H3",
          text: "Stand Out with Unique Style",
          keywords: ["unique", "distinctive", "personal style"],
        },
      ],
    },
    
    {
      level: "H2",
      text: "Fusion Collections",
      keywords: ["collections", "shop", "browse"],
      children: [
        {
          level: "H3",
          text: "For Men",
          link: "/category/fusion?gender=men",
        },
        {
          level: "H3",
          text: "For Women",
          link: "/category/fusion?gender=women",
        },
      ],
    },
  ],
};

// ============================================================================
// KEYWORD DENSITY GUIDE
// ============================================================================

export const KEYWORD_DENSITY_CALCULATOR = {
  guidelines: {
    primaryKeyword: "1-2% density (natural occurrence)",
    secondaryKeywords: "0.5-1% density each",
    LSIKeywords: "Scattered naturally throughout",
    
    example: {
      text: "Premium minimalist fashion for hot climates. Our breathable clothing is designed specifically for the South Asian climate. Minimalist design means less waste, more versatility. Each piece of our breathable linen wear is ethically produced.",
      wordCount: 42,
      keywordFrequency: {
        "minimalist": 2,  // 4.7% - TOO HIGH
        "breathable": 2,   // 4.7% - TOO HIGH  
        "premium": 1,      // 2.3% - GOOD
        "clothing": 1,     // 2.3% - GOOD
      },
      recommendation: "Reduce 'minimalist' and 'breathable' to once, spread across page",
    },
  },

  tools: [
    "Google Search Console: Natural language analysis",
    "Manual review: Read content naturally - should feel like human writing",
    "Ahrefs/SEMrush: Keyword density checker (if using paid tools)",
  ],
};

// ============================================================================
// QUICK CHECKLIST - COPY TO YOUR PROJECT
// ============================================================================

export const IMPLEMENTATION_CHECKLIST = {
  homepage: [
    "[ ] H1 in hero: 'Premium Minimalist Breathable Fashion for the South Asian Climate'",
    "[ ] H2 #1: 'Why Choose Minimalist Fashion' (4 H3s)",
    "[ ] H2 #2: 'Explore Our Collections' (4 H3s)",
    "[ ] H2 #3: 'What Makes AS SIDRAT Different' (3 H3s)",
    "[ ] H2 #4: 'Why Minimalism Matters' (4 H3s)",
    "[ ] H2 #5: 'Join Our Community' (newsletter section)",
    "[ ] Meta title: 'AS SIDRAT | Minimalist Premium...' (60-70 chars)",
    "[ ] Meta description: Starts with 'Shop minimalist...' (155-160 chars)",
    "[ ] Organization schema in hero section",
    "[ ] Open Graph image set",
    "[ ] 6+ internal links with descriptive anchor text",
    "[ ] No keyword stuffing in headings",
  ],

  mensCategory: [
    "[ ] H1: 'Men's Premium Minimalist Fashion | Breathable Linen Clothing'",
    "[ ] H2 #1: 'Premium Men's Linen Shirts for Every Season' (3 H3s)",
    "[ ] H2 #2: 'Why Men Choose AS SIDRAT' (3 H3s)",
    "[ ] H2 #3: 'How to Style Minimalist Fashion' (4 H3s)",
    "[ ] H2 #4: 'Popular Men's Collections' (3 H3s)",
    "[ ] Meta title: 'Men's Minimalist Fashion | Premium Linen...'",
    "[ ] Meta description: 'Shop premium men's minimalist...'",
    "[ ] BreadcrumbList schema",
    "[ ] CollectionPage schema",
    "[ ] Product filter facets working",
    "[ ] Internal links to related products",
    "[ ] Images have descriptive alt text",
  ],

  womensCategory: [
    "[ ] H1: 'Women's Minimalist Fashion | Breathable Ethnic Fusion Wear'",
    "[ ] H2 #1: 'Premium Women's Ethnic Fusion Collections' (3 H3s)",
    "[ ] H2 #2: 'Why Women Love AS SIDRAT' (3 H3s)",
    "[ ] H2 #3: 'Styling Your Minimalist Wardrobe' (3 H3s)",
    "[ ] H2 #4: 'Shop by Occasion' (3 H3s)",
    "[ ] All same technical requirements as mens",
  ],
};

// ============================================================================
// EXPORT ALL REFERENCES
// ============================================================================

export const VISUAL_REFERENCES = {
  homepage: HOMEPAGE_EXACT_STRUCTURE,
  mensCategory: MENS_CATEGORY_STRUCTURE,
  womensCategory: WOMENS_CATEGORY_STRUCTURE,
  fusionCategory: FUSION_CATEGORY_STRUCTURE,
  keywordDensity: KEYWORD_DENSITY_CALCULATOR,
  checklist: IMPLEMENTATION_CHECKLIST,
};
