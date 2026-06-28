/**
 * AS SIDRAT - SEO CONTENT BLUEPRINT & HEADING STRUCTURE GUIDE
 * Homepage & Category Pages Optimization
 * 
 * This guide provides exact heading structures and content organization
 * for maximum Google visibility and ranking potential
 */

// ============================================================================
// HOMEPAGE SEO BLUEPRINT
// ============================================================================

export const HOMEPAGE_BLUEPRINT = {
  // =========================================================================
  // META INFORMATION
  // =========================================================================
  metaTags: {
    title: 'AS SIDRAT | Minimalist Premium Breathable Fashion for Bangladesh',
    description:
      'Shop minimalist, breathable premium fashion designed for the South Asian climate. Ethically-made linen and cotton clothing for men and women. Free delivery in Dhaka.',
    keywords: [
      'minimalist fashion Bangladesh',
      'breathable clothing',
      'premium linen shirts',
      'AS SIDRAT',
    ],
    ogTitle: 'Minimalist Premium Fashion | AS SIDRAT Bangladesh',
    ogDescription:
      'Discover breathable, minimalist premium clothing tailored for the South Asian climate',
    ogImage: '/images/homepage-og.jpg',
    canonicalUrl: 'https://assidrat.com',
  },

  // =========================================================================
  // HEADING STRUCTURE (CRITICAL FOR RANKING)
  // =========================================================================
  headingStructure: {
    h1: {
      text: 'Premium Minimalist Breathable Fashion for the South Asian Climate',
      placement: 'Hero section (top of page)',
      purpose: 'Primary target keyword + brand positioning',
      seoNotes: [
        '✅ Only ONE H1 per page',
        '✅ Includes primary keyword naturally',
        '✅ Clear value proposition',
        '✅ 60-70 characters optimal',
      ],
      alternatives: [
        'Minimalist Premium Fashion Designed for Bangladesh',
        'Breathable Clothing for Hot Climates | AS SIDRAT',
      ],
    },

    h2: {
      count: '3-5 per page',
      sections: [
        {
          text: 'Why Choose Minimalist Fashion',
          placement: 'Feature section',
          purpose: 'Address user intent & brand differentiation',
          subTopics: [
            '✅ Sustainable production',
            '✅ Premium quality materials',
            '✅ Designed for hot climates',
            '✅ Versatile styling options',
          ],
        },
        {
          text: 'Breathable Clothing for Every Season',
          placement: 'Product showcase section',
          purpose: 'Support key differentiator keyword',
          subTopics: [
            '✅ Summer collection highlights',
            '✅ Monsoon-ready pieces',
            '✅ Lightweight linen options',
          ],
        },
        {
          text: 'Explore Our Collections',
          placement: 'Navigation/category preview',
          purpose: 'Guide users to category pages',
          subTopics: [
            '✅ Men\'s minimalist wear',
            '✅ Women\'s ethnic fusion',
            '✅ Accessories & more',
          ],
        },
        {
          text: 'What Makes AS SIDRAT Different',
          placement: 'USP/differentiator section',
          purpose: 'Build brand authority',
          subTopics: [
            '✅ Climate-conscious design',
            '✅ Ethical manufacturing',
            '✅ Premium affordability',
            '✅ Fast delivery (Dhaka)',
          ],
        },
        {
          text: 'Join Our Community of Conscious Consumers',
          placement: 'Newsletter/social section',
          purpose: 'Engagement & conversion',
          subTopics: [
            '✅ Style tips & guides',
            '✅ New collection launches',
            '✅ Exclusive member benefits',
          ],
        },
      ],
    },

    h3: {
      count: '8-12 per page',
      examples: [
        {
          parent: 'Why Choose Minimalist Fashion',
          children: [
            'Premium Quality with Affordable Pricing',
            'Breathable Fabrics for Hot Weather',
            'Sustainable & Ethical Production',
            'Versatile Pieces for Any Occasion',
          ],
        },
        {
          parent: 'Breathable Clothing for Every Season',
          children: [
            'Summer Collection: Stay Cool & Stylish',
            'Monsoon-Ready Fashion',
            'Layering Tips for Minimalists',
            'Care Tips for Linen & Cotton',
          ],
        },
        {
          parent: 'Explore Our Collections',
          children: [
            'Men\'s Linen Shirts',
            'Women\'s Ethnic Fusion',
            'Traditional Panjabi',
            'Minimalist Accessories',
          ],
        },
      ],
      seoNotes: [
        '✅ Each H3 answers a specific user question',
        '✅ Include supporting keywords naturally',
        '✅ Create semantic relationships with H2s',
        '✅ Improve content readability for users',
      ],
    },
  },

  // =========================================================================
  // CONTENT SECTIONS WITH SEO OPTIMIZATION
  // =========================================================================
  sections: {
    heroSection: {
      heading: 'H1: Premium Minimalist Breathable Fashion for the South Asian Climate',
      subheading:
        'Ethically-made, premium clothing designed for hot weather. Free delivery in Dhaka.',
      content: `
        Welcome to AS SIDRAT - where minimalist design meets South Asian climate consciousness.
        
        We create breathable, premium fashion that doesn't compromise on style or ethics.
        Our minimalist linen and cotton collections are designed to keep you cool, 
        comfortable, and elegantly styled throughout the year.
        
        • Breathable fabrics that work with your climate
        • Premium materials at affordable prices
        • Ethical, sustainable production
        • Versatile pieces for every occasion
      `,
      keywordUsage: [
        'breathable clothing (anchor)',
        'minimalist fashion (anchor)',
        'South Asian climate (LSI)',
        'premium fashion (LSI)',
      ],
      cta: 'Shop the Collection',
    },

    differentiatorSection: {
      heading: 'H2: What Makes AS SIDRAT Different',
      content: `
        At AS SIDRAT, we understand that fashion in Bangladesh isn't just about looking good
        - it's about staying comfortable in a challenging climate. Our mission is to prove that
        premium quality and affordability can coexist.
      `,
      h3Sections: [
        {
          heading: 'H3: Climate-Conscious Design',
          content:
            'Every piece is designed specifically for hot, humid weather. We prioritize breathable fabrics like premium linen, organic cotton, and natural blends that keep you cool without sacrificing style.',
        },
        {
          heading: 'H3: Ethical Manufacturing',
          content:
            'We work with fair-trade manufacturers in Bangladesh who meet international labor standards. Quality production means your clothes last longer and your investment supports ethical practices.',
        },
        {
          heading: 'H3: Premium Affordability',
          content:
            'You don\'t have to choose between premium quality and reasonable pricing. By optimizing our production and cutting unnecessary marketing costs, we pass savings to you.',
        },
      ],
      keywordUsage: [
        'climate-conscious (primary)',
        'ethical manufacturing (LSI)',
        'breathable fabrics (supporting)',
      ],
    },

    collectionsPreview: {
      heading: 'H2: Explore Our Collections',
      introText:
        'From traditional panjabi to modern minimalist basics, discover the AS SIDRAT difference across all categories.',
      h3Collections: [
        {
          heading: 'H3: Men\'s Minimalist Wear',
          description:
            'Explore premium linen shirts, breathable panjabi, and versatile casual wear designed for the modern South Asian man.',
          link: '/category/men',
        },
        {
          heading: 'H3: Women\'s Ethnic Fusion',
          description:
            'Traditional ethnic pieces with modern minimalist design. Breathable kameez, fusion dresses, and contemporary traditional wear.',
          link: '/category/women',
        },
        {
          heading: 'H3: Fusion Collections',
          description:
            'Where tradition meets contemporary style. Innovative pieces that blend cultural heritage with modern minimalism.',
          link: '/category/fusion',
        },
        {
          heading: 'H3: Accessories & Essentials',
          description:
            'Complete your minimalist wardrobe with handcrafted accessories that complement your AS SIDRAT pieces.',
          link: '/category/accessories',
        },
      ],
      keywordUsage: [
        'minimalist wear (primary)',
        'ethnic fusion (primary)',
        'panjabi (primary)',
        'breathable (supporting)',
      ],
    },

    whyChooseSection: {
      heading: 'H2: Why Choose Minimalist Fashion',
      content:
        'Minimalism isn\'t about having less - it\'s about having better. Quality over quantity. Purpose over trend.',
      h3Points: [
        {
          heading: 'H3: Build a Versatile Wardrobe',
          content:
            'With a minimalist approach, each piece works together. Mix and match fewer items to create more outfits. Save money. Save time. Feel more confident.',
        },
        {
          heading: 'H3: Quality That Lasts',
          content:
            'Premium materials and ethical manufacturing mean your clothes survive countless washes and seasons. Real value for your investment.',
        },
        {
          heading: 'H3: Sustainable Fashion',
          content:
            'Buying less, buying better means less waste. Our minimalist philosophy aligns with sustainable consumption for a healthier planet.',
        },
        {
          heading: 'H3: Perfect for Hot Climates',
          content:
            'Minimalist design + breathable fabrics = comfort in humidity. Say goodbye to overheated wardrobes that don\'t breathe.',
        },
      ],
    },

    socialProof: {
      heading: 'H2: Join Our Community of Conscious Consumers',
      content:
        'Thousands of Bangladeshi consumers trust AS SIDRAT for premium, climate-appropriate fashion.',
      elements: [
        'Customer testimonials',
        'Instagram gallery showcasing real customers',
        'Newsletter signup with exclusive benefits',
        'Reviews and ratings',
      ],
      keywordUsage: [
        'conscious consumers (LSI)',
        'Bangladesh (local)',
        'premium fashion (primary)',
      ],
    },
  },

  // =========================================================================
  // INTERNAL LINKING STRATEGY
  // =========================================================================
  internalLinking: [
    {
      anchor: 'men\'s minimalist wear',
      url: '/category/men',
      reason: 'Cross-category traffic distribution',
    },
    {
      anchor: 'women\'s ethnic fusion',
      url: '/category/women',
      reason: 'Category page authority building',
    },
    {
      anchor: 'breathable linen shirts',
      url: '/product/classic-linen-shirt',
      reason: 'Product-level conversion',
    },
    {
      anchor: 'size guide',
      url: '/help/size-guide',
      reason: 'Support & UX improvement',
    },
    {
      anchor: 'shipping & delivery',
      url: '/help/shipping',
      reason: 'Trust & credibility',
    },
  ],

  // =========================================================================
  // SCHEMA MARKUP (JSON-LD)
  // =========================================================================
  schemaMarkup: {
    type: 'Organization',
    properties: {
      name: 'AS SIDRAT',
      description: 'Premium minimalist breathable fashion for South Asia',
      url: 'https://assidrat.com',
      logo: 'https://assidrat.com/logo.png',
      sameAs: [
        'https://instagram.com/assidrat',
        'https://facebook.com/assidrat',
      ],
      address: {
        streetAddress: 'Dhaka',
        country: 'Bangladesh',
      },
      contactPoint: {
        contactType: 'Customer Support',
        email: 'support@assidrat.com',
      },
    },
  },
};

// ============================================================================
// CATEGORY PAGE SEO BLUEPRINT
// ============================================================================

export const CATEGORY_BLUEPRINT = {
  men: {
    metaTags: {
      title: "Men's Minimalist Fashion | Premium Linen Shirts Bangladesh",
      description:
        "Shop premium men's minimalist clothing - linen shirts, breathable casual wear, and traditional panjabi designed for hot climates. Free delivery Dhaka.",
      keywords: [
        'men\'s linen shirts',
        'men\'s minimalist clothing',
        'men\'s casual wear Bangladesh',
        'premium panjabi',
      ],
    },

    headingStructure: {
      h1: 'Men\'s Premium Minimalist Fashion | Breathable Linen Clothing',
      h2Sections: [
        {
          text: 'Premium Men\'s Linen Shirts for Every Season',
          purpose: 'Lead category keyword',
          h3Children: [
            'Casual Linen Shirts for Daily Wear',
            'Breathable Panjabi for Formal Occasions',
            'Office-Ready Minimalist Pieces',
          ],
        },
        {
          text: 'Why Men Choose AS SIDRAT',
          purpose: 'Brand differentiation',
          h3Children: [
            'Quality That Lasts Through Seasons',
            'Style Without Compromise',
            'Comfort in Hot Weather',
          ],
        },
        {
          text: 'How to Style Minimalist Fashion',
          purpose: 'Content engagement',
          h3Children: [
            'Casual Day Styling Guide',
            'Office-to-Weekend Outfits',
            'Layering for Minimalists',
          ],
        },
        {
          text: 'Popular Men\'s Collections',
          purpose: 'Product showcasing',
          h3Children: [
            'Shop Classic Linen Shirts',
            'Browse Traditional Panjabi',
            'Explore Fusion Wear',
          ],
        },
      ],
    },

    contentStructure: {
      intro: `
        Welcome to AS SIDRAT Men's Collection - where premium minimalist fashion meets 
        South Asian climate consciousness. Every piece in our men's range is designed 
        specifically for comfort in hot, humid weather without sacrificing style.
      `,
      features: [
        'Premium breathable fabrics',
        'Minimalist, versatile design',
        'Ethical manufacturing',
        'Affordable luxury',
        'Fast delivery in Dhaka',
      ],
      sections: [
        {
          heading: 'H2: Premium Men\'s Linen Shirts for Every Season',
          h3s: [
            'H3: Casual Linen Shirts for Daily Wear',
            'H3: Breathable Panjabi for Formal Occasions',
            'H3: Office-Ready Minimalist Pieces',
          ],
        },
        {
          heading: 'H2: Why Men Choose AS SIDRAT',
          content:
            'Quality, style, and comfort. That\'s what AS SIDRAT stands for. Our men\'s collection is built on the promise that premium doesn\'t have to be unaffordable.',
          h3s: [
            'H3: Quality That Lasts Through Seasons',
            'H3: Style Without Compromise',
            'H3: Comfort in Hot Weather',
          ],
        },
      ],
    },

    internalLinking: [
      { anchor: 'Classic Linen Shirt', url: '/product/classic-linen-shirt' },
      { anchor: 'men\'s panjabi', url: '/product/indigo-panjabi' },
      { anchor: 'size guide', url: '/help/size-guide' },
      { anchor: 'shop all accessories', url: '/category/accessories' },
    ],

    filteringFacets: [
      'Price range',
      'Color',
      'Material (Linen, Cotton, Blend)',
      'Fit (Regular, Slim, Oversized)',
      'Occasion (Casual, Formal, Office)',
      'New arrivals',
      'Best sellers',
      'On sale',
    ],
  },

  women: {
    metaTags: {
      title: "Women's Minimalist Fashion | Ethnic Fusion Wear Bangladesh",
      description:
        "Discover minimalist women's fashion - breathable ethnic fusion wear, traditional kameez, and contemporary casual clothing designed for the South Asian climate.",
      keywords: [
        'women\'s minimalist fashion',
        'women\'s ethnic wear',
        'breathable women\'s clothing',
        'traditional kameez Bangladesh',
      ],
    },

    headingStructure: {
      h1: 'Women\'s Minimalist Fashion | Breathable Ethnic Fusion Wear',
      h2Sections: [
        {
          text: 'Premium Women\'s Ethnic Fusion Collections',
          purpose: 'Lead category keyword',
          h3Children: [
            'Modern Minimalist Kameez',
            'Contemporary Fusion Dresses',
            'Breathable Traditional Wear',
          ],
        },
        {
          text: 'Why Women Love AS SIDRAT',
          purpose: 'Brand positioning',
          h3Children: [
            'Breathable Comfort for Humid Weather',
            'Versatile Pieces for Modern Life',
            'Sustainable Fashion Choices',
          ],
        },
        {
          text: 'Styling Your Minimalist Wardrobe',
          purpose: 'Educational content',
          h3Children: [
            'Daily Wear Styling Ideas',
            'Occasion-Ready Outfits',
            'Layering & Accessorizing Tips',
          ],
        },
        {
          text: 'Shop by Occasion',
          purpose: 'Navigation & conversion',
          h3Children: [
            'Casual Weekend Wear',
            'Office-Appropriate Fashion',
            'Festive Collections',
          ],
        },
      ],
    },

    contentStructure: {
      intro: `
        Welcome to AS SIDRAT Women's Collection - where tradition meets contemporary minimalism.
        Our women's fashion is designed for the modern South Asian woman who values comfort,
        style, and sustainable choices.
      `,
      features: [
        'Breathable ethnic fusion designs',
        'Traditional meets modern styling',
        'Premium sustainable materials',
        'Versatile minimalist pieces',
        'Inclusive sizing options',
      ],
    },

    internalLinking: [
      { anchor: 'women\'s fusion dresses', url: '/product/fusion-dress' },
      { anchor: 'traditional kameez', url: '/product/indigo-kameez' },
      { anchor: 'fabric care tips', url: '/help/fabric-care' },
      { anchor: 'return policy', url: '/help/returns' },
    ],

    filteringFacets: [
      'Price range',
      'Color',
      'Material',
      'Fit (Fitted, Regular, Oversized)',
      'Occasion',
      'Collection (New, Best Sellers, Sale)',
    ],
  },

  fusion: {
    metaTags: {
      title: 'Fusion Fashion Collections | Contemporary Ethnic Wear Bangladesh',
      description:
        'Explore fusion fashion where tradition meets modern minimalism. Contemporary ethnic wear designed for urban South Asian lifestyle.',
    },

    headingStructure: {
      h1: 'Fusion Fashion | Where Tradition Meets Minimalism',
      h2Sections: [
        {
          text: 'Contemporary Ethnic Fusion Wear',
          h3Children: [
            'Modern Panjabi with Minimalist Design',
            'Fusion Dresses for Urban Lifestyle',
            'East-Meets-West Fashion',
          ],
        },
      ],
    },
  },
};

// ============================================================================
// SEO BEST PRACTICES FOR HEADINGS
// ============================================================================

export const HEADING_BEST_PRACTICES = {
  h1Rules: [
    '✅ One H1 per page (Google requirement)',
    '✅ Include primary target keyword naturally',
    '✅ Keep 60-70 characters for optimal display',
    '✅ Avoid keyword stuffing',
    '✅ Make it compelling - users should want to read',
    '✅ Reflect page content accurately',
    '❌ Don\'t use for branding only - must describe content',
  ],

  h2Rules: [
    '✅ Use 3-5 H2s per page for structure',
    '✅ Each H2 should represent a major section',
    '✅ Use supporting keywords in H2s',
    '✅ Maintain logical hierarchy',
    '✅ Make each H2 distinct and meaningful',
    '❌ Don\'t use H2 for decorative text',
    '❌ Don\'t skip heading levels (no H3 without H2)',
  ],

  h3Rules: [
    '✅ Use multiple H3s under each H2',
    '✅ Break down complex topics into sections',
    '✅ Include long-tail keyword variations',
    '✅ Answer specific user questions',
    '✅ Improve content readability',
    '❌ Don\'t overuse - 8-12 per page is typical',
  ],

  keywordPlacement: [
    '✅ Primary keyword in H1 (near beginning)',
    '✅ Secondary keywords in first H2',
    '✅ LSI keywords (related) in other H2s & H3s',
    '✅ Long-tail variations in H3s',
    '✅ Natural, not forced placement',
    '❌ Don\'t stuff same keyword everywhere',
  ],

  userExperienceRules: [
    '✅ Headings should guide user through content',
    '✅ Make content scannable',
    '✅ Clear visual hierarchy',
    '✅ Answer user questions in logical order',
    '✅ Headings as "mini table of contents"',
  ],
};

// ============================================================================
// COMMON MISTAKES TO AVOID
// ============================================================================

export const MISTAKES_TO_AVOID = {
  heading: [
    {
      mistake: 'Multiple H1 tags on one page',
      why: 'Confuses Google about main topic',
      fix: 'Use only ONE H1 per page',
    },
    {
      mistake: 'Skipping heading levels (H1 → H3)',
      why: 'Breaks semantic HTML structure',
      fix: 'Follow logical hierarchy: H1 → H2 → H3',
    },
    {
      mistake: 'Keyword stuffing in headings',
      why: 'Looks spammy to users and Google',
      fix: 'Use keywords naturally once',
    },
    {
      mistake: 'Headings that don\'t match content',
      why: 'Poor UX and high bounce rate',
      fix: 'Ensure heading reflects section content',
    },
  ],

  content: [
    {
      mistake: 'No clear heading structure',
      why: 'Hard to read, poor SEO signals',
      fix: 'Organize with H1, H2, H3 hierarchy',
    },
    {
      mistake: 'Not answering user intent',
      why: 'High bounce rate',
      fix: 'Address specific user questions in headings',
    },
    {
      mistake: 'Ignoring local/Bengali keywords',
      why: 'Missing Bangladeshi traffic',
      fix: 'Include Bengali phrases in content',
    },
  ],
};

// ============================================================================
// EXPORT ALL BLUEPRINTS
// ============================================================================

export const CONTENT_BLUEPRINTS = {
  homepage: HOMEPAGE_BLUEPRINT,
  categories: CATEGORY_BLUEPRINT,
  bestPractices: HEADING_BEST_PRACTICES,
};
