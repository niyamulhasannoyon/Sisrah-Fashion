/**
 * SITEMAP & ROBOTS.TXT - IMPLEMENTATION EXAMPLES & CHECKLIST
 * 
 * This file contains practical examples and a deployment checklist
 */

// ============================================================================
// EXAMPLE 1: VERIFY SITEMAP IS WORKING
// ============================================================================

/**
 * Test sitemap generation in development
 */
export async function testSitemapGeneration() {
  console.log('🔍 Testing sitemap generation...\n');

  try {
    // Import the sitemap function
    const { default: sitemapFunction } = await import('@/app/sitemap');

    // Generate sitemap
    const sitemap = await sitemapFunction();

    console.log(`✅ Sitemap generated successfully`);
    console.log(`📊 Total URLs: ${sitemap.length}`);

    // Show first 5 URLs
    console.log('\n📝 First 5 URLs:');
    sitemap.slice(0, 5).forEach((url: any, idx: number) => {
      console.log(`  ${idx + 1}. ${url.url}`);
      console.log(`     - Priority: ${url.priority}`);
      console.log(`     - ChangeFreq: ${url.changeFrequency}`);
    });

    // Count by type
    const homepageCount = sitemap.filter((u: any) => u.url === 'https://assidrat.com').length;
    const categoryCount = sitemap.filter((u: any) => u.url.includes('/category/')).length;
    const productCount = sitemap.filter((u: any) => u.url.includes('/product/')).length;

    console.log('\n📈 Breakdown:');
    console.log(`  - Homepage: ${homepageCount}`);
    console.log(`  - Categories: ${categoryCount}`);
    console.log(`  - Products: ${productCount}`);

    return true;
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    return false;
  }
}

// ============================================================================
// EXAMPLE 2: VERIFY ROBOTS.TXT RULES
// ============================================================================

/**
 * Test robots.txt path blocking
 */
export async function testRobotsTxtRules() {
  console.log('🤖 Testing robots.txt rules...\n');

  const { testRobotsPath } = await import('@/lib/seo/sitemapAndRobotsUtils');

  const testCases = [
    {
      path: '/shop',
      shouldAllow: true,
      description: 'Shop page (should be crawled)',
    },
    {
      path: '/product/classic-linen-shirt',
      shouldAllow: true,
      description: 'Product page (should be crawled)',
    },
    {
      path: '/admin/dashboard',
      shouldAllow: false,
      description: 'Admin page (should be blocked)',
    },
    {
      path: '/checkout',
      shouldAllow: false,
      description: 'Checkout (should be blocked)',
    },
    {
      path: '/profile/settings',
      shouldAllow: false,
      description: 'Profile (should be blocked)',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    const result = await testRobotsPath(test.path);
    const status = result.allowed === test.shouldAllow ? '✅' : '❌';

    console.log(
      `${status} ${test.description}`
    );
    console.log(
      `   Path: ${test.path} - ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`
    );

    if (result.allowed === test.shouldAllow) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// ============================================================================
// EXAMPLE 3: DEPLOYMENT CHECKLIST
// ============================================================================

export const DEPLOYMENT_CHECKLIST = {
  'Pre-Deployment': [
    {
      task: 'Verify sitemap.ts exists',
      command: 'ls -la app/sitemap.ts',
      details:
        'Should output file path if exists. File must be in app/ directory for Next.js to recognize it.',
    },
    {
      task: 'Verify robots.txt exists',
      command: 'ls -la public/robots.txt',
      details:
        'Should output file path. robots.txt must be in public/ folder to be served at /robots.txt',
    },
    {
      task: 'Test sitemap generation locally',
      command: 'npm run dev && curl http://localhost:3000/sitemap.xml',
      details:
        'Should return XML with URLs. If error, check database connection in sitemap.ts',
    },
    {
      task: 'Verify robots.txt content',
      command: 'cat public/robots.txt | head -20',
      details:
        'Should show User-agent and Disallow/Allow rules. Check for syntax errors.',
    },
    {
      task: 'Run build',
      command: 'npm run build',
      details:
        'Should complete without errors. Warnings about build size are OK.',
    },
  ],

  'Post-Deployment': [
    {
      task: 'Test sitemap accessibility',
      command: 'curl https://assidrat.com/sitemap.xml | head -20',
      details:
        'Should return XML starting with <?xml version="1.0"?>. Status code should be 200.',
    },
    {
      task: 'Test robots.txt accessibility',
      command: 'curl https://assidrat.com/robots.txt | head -10',
      details:
        'Should return robots.txt content with User-agent directive. Status code should be 200.',
    },
    {
      task: 'Verify robots.txt blocks checkout',
      command: 'curl https://assidrat.com/robots.txt | grep -i checkout',
      details:
        'Should show "Disallow: /checkout" if checkout blocking is implemented.',
    },
    {
      task: 'Verify robots.txt points to sitemap',
      command: 'curl https://assidrat.com/robots.txt | grep -i sitemap',
      details:
        'Should show "Sitemap: https://assidrat.com/sitemap.xml"',
    },
    {
      task: 'Check sitemap has products',
      command:
        'curl https://assidrat.com/sitemap.xml | grep -o "<url>" | wc -l',
      details:
        'Should show number of URLs. If 0, check database connection and products in DB.',
    },
  ],

  'Google Search Console': [
    {
      task: 'Sign in to GSC',
      url: 'https://search.google.com/search-console',
      details: 'Select assidrat.com property',
    },
    {
      task: 'Submit sitemap',
      details:
        'Go to Sitemaps section → New Sitemap → Enter https://assidrat.com/sitemap.xml → Submit',
    },
    {
      task: 'Check robots.txt',
      url: 'https://search.google.com/search-console/robots-testing-tool',
      details: 'Test various paths to ensure blocking/allowing works correctly',
    },
    {
      task: 'Monitor Crawl Stats',
      details:
        'Go to Crawl Stats dashboard. Requests per day should be stable and reasonable.',
    },
    {
      task: 'Check Coverage',
      details: 'Look for "No errors or warnings" status. Fix any blocking or indexing issues.',
    },
  ],

  'Ongoing Monitoring': [
    {
      task: 'Weekly: Check indexation rate',
      details: 'GSC → Sitemaps. Should be 85%+ of submitted URLs indexed.',
    },
    {
      task: 'Weekly: Check crawl budget',
      details:
        'GSC → Crawl Stats. Requests per day should be stable. Increasing may indicate issues.',
    },
    {
      task: 'Monthly: Update products',
      details:
        'New products added/removed should automatically update in sitemap. Verify this.',
    },
    {
      task: 'Monthly: Review blocked pages',
      details:
        'GSC → Coverage. Verify expected pages are not indexed (/admin, /checkout, etc).',
    },
    {
      task: 'Quarterly: Full audit',
      details:
        'Run full SEO audit using the monitoring utilities. Fix any new issues.',
    },
  ],
};

// ============================================================================
// EXAMPLE 4: TROUBLESHOOTING GUIDE
// ============================================================================

export const TROUBLESHOOTING = {
  'Sitemap not found (404)': {
    cause: 'app/sitemap.ts not in correct location or missing',
    solutions: [
      'Verify file is at app/sitemap.ts (not src/app/)',
      'Check file exports default function',
      'Rebuild: npm run build',
      'Clear .next cache: rm -rf .next',
      'Test locally: npm run dev && curl localhost:3000/sitemap.xml',
    ],
  },

  'Sitemap returns 500 error': {
    cause: 'Database connection error or product query failing',
    solutions: [
      'Check MongoDB connection string',
      'Verify Product model imports correctly',
      'Test DB connection: npm run db-check (if script exists)',
      'Check server logs for detailed error',
      'Temporarily remove DB query to test: return generateStaticPages()',
    ],
  },

  'Robots.txt not being served': {
    cause: 'File not in public/ directory or server misconfiguration',
    solutions: [
      'Verify file location: ls -la public/robots.txt',
      'Check file permissions: chmod 644 public/robots.txt',
      'Test locally: npm run dev && curl localhost:3000/robots.txt',
      'Rebuild and restart: npm run build && npm start',
    ],
  },

  'Products not in sitemap': {
    cause: 'No products in database or query filter too strict',
    solutions: [
      'Check products exist: db.products.count()',
      'Verify products are active: db.products.find({ isActive: true })',
      'Check slug field exists: db.products.findOne().slug',
      'Remove DB query temporarily to test static pages only',
      'Check database connection in sitemap.ts',
    ],
  },

  'Google not indexing products': {
    cause:
      'Blocked by robots.txt, noindex meta tag, or quality issues',
    solutions: [
      'Verify not blocked by robots.txt: curl robots.txt | grep -i disallow',
      'Check product page for noindex meta tag',
      'Check GSC Coverage for errors',
      'Request indexing manually in GSC for specific URLs',
      'Wait 24-48 hours for Google to reindex',
    ],
  },

  'Robots.txt blocking allowed pages': {
    cause: 'Syntax error or incorrect path pattern',
    solutions: [
      'Validate robots.txt at: https://www.screaming-frog.co.uk/seo-spider/',
      'Check for conflicting rules (Allow vs Disallow order)',
      'Test specific path: curl robots.txt && grep "Disallow: /shop"',
      'Verify wildcard patterns are correct',
      'Check for accidental blocking of root: Disallow: /',
    ],
  },
};

// ============================================================================
// EXAMPLE 5: QUICK START COMMANDS
// ============================================================================

export const QUICK_COMMANDS = {
  development: [
    {
      description: 'Test sitemap locally',
      command: 'npm run dev && curl http://localhost:3000/sitemap.xml',
    },
    {
      description: 'Test robots.txt locally',
      command: 'npm run dev && curl http://localhost:3000/robots.txt',
    },
    {
      description: 'Count products in sitemap',
      command:
        'npm run dev && curl http://localhost:3000/sitemap.xml | grep -o /product/ | wc -l',
    },
    {
      description: 'Validate robots.txt syntax',
      command: 'cat public/robots.txt | sed "s/^/CHECK: /"',
    },
  ],

  production: [
    {
      description: 'Test production sitemap',
      command: 'curl https://assidrat.com/sitemap.xml | head -30',
    },
    {
      description: 'Test production robots.txt',
      command: 'curl https://assidrat.com/robots.txt | head -20',
    },
    {
      description: 'Count production products',
      command: 'curl https://assidrat.com/sitemap.xml | grep -o /product/ | wc -l',
    },
    {
      description: 'Check if path is blocked',
      command: 'curl https://assidrat.com/robots.txt | grep "Disallow: /checkout"',
    },
  ],

  validation: [
    {
      description: 'Validate XML syntax',
      command: 'curl https://assidrat.com/sitemap.xml | xmllint --noout -',
    },
    {
      description: 'Check for lastmod timestamps',
      command:
        'curl https://assidrat.com/sitemap.xml | grep -o "<lastmod>[^<]*</lastmod>" | head -5',
    },
    {
      description: 'Check for priority values',
      command:
        'curl https://assidrat.com/sitemap.xml | grep -o "<priority>[^<]*</priority>" | sort | uniq -c',
    },
  ],
};

// ============================================================================
// EXAMPLE 6: MONITORING SCRIPT
// ============================================================================

/**
 * Run comprehensive monitoring (can be scheduled daily)
 */
export async function runDailyMonitoring() {
  console.log('📊 DAILY SEO MONITORING\n');
  console.log('═'.repeat(60) + '\n');

  try {
    // 1. Test sitemap generation
    console.log('1️⃣  Testing Sitemap Generation...');
    const sitemapOK = await testSitemapGeneration();

    // 2. Test robots.txt rules
    console.log('\n2️⃣  Testing Robots.txt Rules...');
    const robotsOK = await testRobotsTxtRules();

    // 3. Generate report
    console.log('\n3️⃣  Generating Detailed Report...');
    const { generateSEOAuditReport } = await import(
      '@/lib/seo/sitemapAndRobotsUtils'
    );
    await generateSEOAuditReport();

    // Summary
    console.log('\n' + '═'.repeat(60));
    const allOK = sitemapOK && robotsOK;
    console.log(`\n${allOK ? '✅' : '❌'} MONITORING ${allOK ? 'PASSED' : 'FAILED'}\n`);

    if (!allOK) {
      console.log('⚠️  Please check the issues above and fix before deploying.\n');
    }

    return allOK;
  } catch (error) {
    console.error('❌ Monitoring error:', error);
    return false;
  }
}

// ============================================================================
// IMPLEMENTATION STEPS
// ============================================================================

/*
STEP-BY-STEP IMPLEMENTATION:

1. CREATE SITEMAP (✅ Done - app/sitemap.ts)
   - Fetches all products from MongoDB
   - Includes static pages and categories
   - Automatically generates /sitemap.xml
   - Next.js handles caching and revalidation

2. CREATE ROBOTS.TXT (✅ Done - public/robots.txt)
   - Blocks sensitive pages (/admin, /checkout, /profile)
   - Allows product and category pages
   - Points to sitemap.xml
   - Follows SEO best practices

3. TEST LOCALLY
   npm run dev
   curl http://localhost:3000/sitemap.xml
   curl http://localhost:3000/robots.txt

4. DEPLOY TO PRODUCTION
   git add .
   git commit -m "Add sitemap and robots.txt"
   git push

5. VERIFY IN PRODUCTION
   curl https://assidrat.com/sitemap.xml
   curl https://assidrat.com/robots.txt

6. SUBMIT TO SEARCH ENGINES
   - Google Search Console: Submit sitemap
   - Bing Webmaster Tools: Submit sitemap
   - Monitor crawl stats

7. MONITOR ONGOING
   - Check GSC daily for crawl errors
   - Monitor indexation rate
   - Watch for blocked URLs
   - Review monthly crawl stats

8. OPTIMIZE
   - Track rankings for products
   - Monitor organic traffic
   - Improve products not ranking
   - Update priorities based on performance
*/

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const TEST_UTILITIES = {
  testSitemapGeneration,
  testRobotsTxtRules,
  runDailyMonitoring,
};
