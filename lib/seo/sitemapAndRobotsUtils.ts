/**
 * SITEMAP & ROBOTS.TXT MONITORING & MANAGEMENT UTILITIES
 * 
 * Helper functions for:
 * - Validating robots.txt syntax
 * - Analyzing sitemap contents
 * - Monitoring crawl directives
 * - Debugging indexation issues
 */

import { readFile } from 'fs/promises';
import path from 'path';

/**
 * ============================================================================
 * ROBOTS.TXT VALIDATION
 * ============================================================================
 */

export interface RobotsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    allowRules: number;
    disallowRules: number;
    userAgents: number;
    hasSitemap: boolean;
  };
}

/**
 * Validates robots.txt file for syntax errors and best practices
 */
export async function validateRobotsTxt(filePath?: string): Promise<RobotsValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const robotsPath = filePath || path.join(process.cwd(), 'public', 'robots.txt');
    const content = await readFile(robotsPath, 'utf-8');
    const lines = content.split('\n');

    let allowRules = 0;
    let disallowRules = 0;
    let userAgents = 0;
    let hasSitemap = false;
    let lastDirectiveType = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip comments and empty lines
      if (!line || line.startsWith('#')) continue;

      const [directive, ...valueParts] = line.split(':');
      const directiveType = directive.trim().toLowerCase();
      const value = valueParts.join(':').trim();

      // Validate directive name
      const validDirectives = [
        'user-agent',
        'allow',
        'disallow',
        'crawl-delay',
        'request-timeout',
        'sitemap',
      ];

      if (!validDirectives.includes(directiveType)) {
        warnings.push(`Line ${i + 1}: Unknown directive "${directiveType}"`);
      }

      // Count directives
      if (directiveType === 'user-agent') {
        userAgents++;
      } else if (directiveType === 'allow') {
        allowRules++;
      } else if (directiveType === 'disallow') {
        disallowRules++;
      } else if (directiveType === 'sitemap') {
        hasSitemap = true;

        // Validate sitemap URL
        if (!value.startsWith('http')) {
          errors.push(`Line ${i + 1}: Sitemap URL must be absolute (${value})`);
        }
      }

      // Check for case sensitivity (directives should be case-insensitive but conventionally lowercase)
      if (directive !== directive.toLowerCase()) {
        warnings.push(
          `Line ${i + 1}: Directive "${directive}" should be lowercase`
        );
      }

      lastDirectiveType = directiveType;
    }

    // Validations
    if (userAgents === 0) {
      errors.push('No User-agent directive found');
    }

    if (disallowRules === 0 && allowRules === 0) {
      warnings.push('No Allow or Disallow rules found - is this intentional?');
    }

    if (!hasSitemap) {
      warnings.push('No Sitemap directive found - consider adding one');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        allowRules,
        disallowRules,
        userAgents,
        hasSitemap,
      },
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`Failed to read robots.txt: ${error}`],
      warnings: [],
      stats: {
        allowRules: 0,
        disallowRules: 0,
        userAgents: 0,
        hasSitemap: false,
      },
    };
  }
}

/**
 * ============================================================================
 * ROBOTS.TXT TESTING
 * ============================================================================
 */

/**
 * Test if a path would be allowed by robots.txt
 */
export async function testRobotsPath(
  path: string,
  userAgent: string = '*'
): Promise<{ allowed: boolean; rule: string }> {
  try {
    const robotsPath = process.cwd() + '/public/robots.txt';
    const content = await readFile(robotsPath, 'utf-8');
    const lines = content.split('\n');

    let currentUserAgent = '*';
    let allowed = true;
    let matchedRule = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const [directive, ...valueParts] = trimmed.split(':');
      const directiveType = directive.trim().toLowerCase();
      const value = valueParts.join(':').trim();

      if (directiveType === 'user-agent') {
        currentUserAgent = value;
      }

      // Check if rule applies to this user agent
      if (currentUserAgent === userAgent || currentUserAgent === '*') {
        if (directiveType === 'disallow') {
          if (matchesPath(path, value)) {
            allowed = false;
            matchedRule = `Disallow: ${value}`;
          }
        } else if (directiveType === 'allow') {
          if (matchesPath(path, value)) {
            allowed = true;
            matchedRule = `Allow: ${value}`;
          }
        }
      }
    }

    return { allowed, rule: matchedRule };
  } catch (error) {
    return { allowed: true, rule: 'Error reading robots.txt' };
  }
}

/**
 * Check if a URL path matches a robots.txt pattern
 * Supports wildcards and exact matches
 */
function matchesPath(urlPath: string, pattern: string): boolean {
  // Normalize paths
  urlPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;

  if (pattern === '/' && urlPath === '/') return true;
  if (pattern === '/' && urlPath !== '/') return false;

  // Remove leading slash from pattern if present
  if (pattern.startsWith('/')) {
    pattern = pattern.substring(1);
  }

  // Handle exact matches
  if (!pattern.includes('*')) {
    return urlPath.startsWith('/' + pattern);
  }

  // Handle wildcard patterns
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*'));
  return regex.test(urlPath.substring(1));
}

/**
 * ============================================================================
 * SITEMAP ANALYSIS
 * ============================================================================
 */

export interface SitemapStats {
  totalUrls: number;
  categories: number;
  products: number;
  staticPages: number;
  lastUpdateDate: string;
  sitemapSize: number;
  estimatedCrawlTime: number; // in seconds
}

/**
 * Fetch and analyze sitemap.xml
 */
export async function analyzeSitemap(
  siteUrl: string = 'https://assidrat.com'
): Promise<SitemapStats | null> {
  try {
    const response = await fetch(`${siteUrl}/sitemap.xml`);
    const xml = await response.text();

    // Count URLs
    const urlMatches = xml.match(/<url>/g) || [];
    const totalUrls = urlMatches.length;

    // Count products (contains /product/)
    const productMatches = xml.match(/<loc>.*\/product\/.*<\/loc>/g) || [];
    const products = productMatches.length;

    // Count categories (contains /category/)
    const categoryMatches = xml.match(/<loc>.*\/category\/.*<\/loc>/g) || [];
    const categories = categoryMatches.length;

    // Static pages
    const staticPages = totalUrls - products - categories;

    // Get latest update date
    const dateMatches = xml.match(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g) || [];
    const lastUpdateDate = dateMatches.length > 0
      ? dateMatches[dateMatches.length - 1].replace(/<\/?lastmod>/g, '')
      : 'Unknown';

    // Calculate size
    const sitemapSize = Buffer.byteLength(xml, 'utf-8');

    // Estimate crawl time (assuming 1 second per URL)
    const estimatedCrawlTime = totalUrls * 1;

    return {
      totalUrls,
      categories,
      products,
      staticPages,
      lastUpdateDate,
      sitemapSize,
      estimatedCrawlTime,
    };
  } catch (error) {
    console.error('Error analyzing sitemap:', error);
    return null;
  }
}

/**
 * ============================================================================
 * MONITORING REPORTS
 * ============================================================================
 */

/**
 * Generate a comprehensive SEO audit report
 */
export async function generateSEOAuditReport(siteUrl: string = 'https://assidrat.com') {
  console.log('\n🔍 SEO CRAWL DIRECTIVES AUDIT REPORT\n');
  console.log('═'.repeat(60));

  // 1. Robots.txt validation
  console.log('\n📄 ROBOTS.TXT VALIDATION');
  console.log('─'.repeat(60));

  const robotsValidation = await validateRobotsTxt();
  console.log(`Status: ${robotsValidation.valid ? '✅ Valid' : '❌ Invalid'}`);
  console.log(`User-Agents: ${robotsValidation.stats.userAgents}`);
  console.log(`Allow Rules: ${robotsValidation.stats.allowRules}`);
  console.log(`Disallow Rules: ${robotsValidation.stats.disallowRules}`);
  console.log(`Has Sitemap: ${robotsValidation.stats.hasSitemap ? '✅ Yes' : '❌ No'}`);

  if (robotsValidation.errors.length > 0) {
    console.log('\n❌ Errors:');
    robotsValidation.errors.forEach(err => console.log(`  - ${err}`));
  }

  if (robotsValidation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    robotsValidation.warnings.forEach(warn => console.log(`  - ${warn}`));
  }

  // 2. Sitemap analysis
  console.log('\n\n🗺️  SITEMAP ANALYSIS');
  console.log('─'.repeat(60));

  const sitemapStats = await analyzeSitemap(siteUrl);
  if (sitemapStats) {
    console.log(`Total URLs: ${sitemapStats.totalUrls}`);
    console.log(`  - Categories: ${sitemapStats.categories}`);
    console.log(`  - Products: ${sitemapStats.products}`);
    console.log(`  - Static Pages: ${sitemapStats.staticPages}`);
    console.log(`Sitemap Size: ${(sitemapStats.sitemapSize / 1024).toFixed(2)} KB`);
    console.log(`Last Updated: ${sitemapStats.lastUpdateDate}`);
    console.log(`Est. Crawl Time: ${Math.ceil(sitemapStats.estimatedCrawlTime / 60)} minutes`);
  }

  // 3. Common paths test
  console.log('\n\n🚀 COMMON PATHS TEST');
  console.log('─'.repeat(60));

  const testPaths = [
    { path: '/', expected: true, label: 'Homepage' },
    { path: '/shop', expected: true, label: 'Shop' },
    { path: '/product/test-product', expected: true, label: 'Product Page' },
    { path: '/category/men', expected: true, label: 'Category' },
    { path: '/checkout', expected: false, label: 'Checkout (blocked)' },
    { path: '/admin', expected: false, label: 'Admin (blocked)' },
    { path: '/profile', expected: false, label: 'Profile (blocked)' },
    { path: '/api/products', expected: false, label: 'API (blocked)' },
  ];

  for (const test of testPaths) {
    const result = await testRobotsPath(test.path);
    const status = result.allowed === test.expected ? '✅' : '❌';
    console.log(`${status} ${test.label}: ${result.allowed ? 'ALLOWED' : 'BLOCKED'}`);
  }

  // Summary
  console.log('\n' + '═'.repeat(60));
  console.log('✅ AUDIT COMPLETE\n');
}

/**
 * ============================================================================
 * NEXT STEPS
 * ============================================================================
 */

/**
 * Generate recommendations based on audit
 */
export async function generateRecommendations() {
  const robotsValidation = await validateRobotsTxt();
  const recommendations: string[] = [];

  if (!robotsValidation.valid) {
    recommendations.push('🔴 Fix robots.txt syntax errors');
  }

  if (!robotsValidation.stats.hasSitemap) {
    recommendations.push('🟡 Add Sitemap directive to robots.txt');
  }

  if (robotsValidation.stats.disallowRules === 0) {
    recommendations.push('🟡 Consider adding Disallow rules for sensitive areas');
  }

  const sitemapStats = await analyzeSitemap();
  if (sitemapStats && sitemapStats.products === 0) {
    recommendations.push('🔴 No products found in sitemap');
  }

  if (sitemapStats && sitemapStats.totalUrls > 50000) {
    recommendations.push('🟡 Consider splitting sitemap into multiple files');
  }

  console.log('\n📋 RECOMMENDATIONS:\n');
  recommendations.forEach(rec => console.log(`  ${rec}`));

  return recommendations;
}

/**
 * Export functions for CLI usage
 */
export const CLI = {
  validateRobots: validateRobotsTxt,
  testPath: testRobotsPath,
  analyzeSitemap,
  auditReport: generateSEOAuditReport,
  recommendations: generateRecommendations,
};

/**
 * Usage:
 * 
 * Run in terminal:
 * node -r ts-node/register lib/seo/sitemapAndRobotsUtils.ts
 * 
 * Or import in your code:
 * import { validateRobotsTxt, testRobotsPath, analyzeSitemap } from '@/lib/seo/sitemapAndRobotsUtils';
 */
