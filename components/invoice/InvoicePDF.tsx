import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// ─────────────────────────── Color Palette ───────────────────────────
const COLORS = {
  // Primary brand
  primary: '#8B1A1A',        // Deep Crimson — main accent
  primaryLight: '#A31F24',   // Slightly lighter crimson
  primaryDark: '#6B1313',    // Darker for depth

  // Neutrals
  charcoal: '#1E1E1E',       // Near-black for body text
  darkGray: '#3D3D3D',       // Secondary headings
  mediumGray: '#6B7280',     // Labels, secondary text
  lightGray: '#9CA3AF',      // Very subtle text

  // Backgrounds & Surfaces
  pageBg: '#FFFFFF',
  cardBg: '#F8F6F3',         // Warm off-white / light cream
  stripeBg: '#FDFBF7',       // Cream table stripe
  border: '#E8E4DE',         // Warm border
  borderLight: '#F0EDE8',    // Lighter border

  // Functional
  white: '#FFFFFF',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
  blue: '#2563EB',
};

// ─────────────────────────── Stylesheet ──────────────────────────────
const styles = StyleSheet.create({
  // ── Page Base ──
  page: {
    padding: 36,
    paddingBottom: 64,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.charcoal,
    backgroundColor: COLORS.pageBg,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 6,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  logoImage: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  brandName: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 5,
    textTransform: 'uppercase',
    color: COLORS.charcoal,
  },
  brandTagline: {
    fontSize: 7,
    color: COLORS.mediumGray,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  headerRight: {
    alignItems: 'flex-end',
    flexDirection: 'column',
    gap: 6,
  },
  invoiceBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  invoiceBadgeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 6,
    textTransform: 'uppercase',
  },
  invoiceNumber: {
    fontSize: 9,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // ── Meta Cards (side-by-side) ──
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  metaCard: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metaAccent: {
    width: 4,
    backgroundColor: COLORS.primary,
  },
  metaContent: {
    flex: 1,
    padding: 12,
    flexDirection: 'column',
    gap: 3,
  },
  metaLabel: {
    fontSize: 7,
    color: COLORS.primary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 2,
  },
  metaName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  metaText: {
    fontSize: 8,
    color: COLORS.darkGray,
    lineHeight: 1.4,
  },

  // ── Section Title ──
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },

  // ── Items Table ──
  table: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
  },
  tableHeaderCell: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: COLORS.white,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    alignItems: 'center',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowAlt: {
    backgroundColor: COLORS.stripeBg,
  },
  tableCell: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 8,
    color: COLORS.charcoal,
  },
  tableCellBold: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  tableCellVariant: {
    fontSize: 7,
    color: COLORS.mediumGray,
    marginTop: 1,
  },

  // ── Payment & Info Row ──
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoBlock: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.cardBg,
    flexDirection: 'column',
    gap: 2,
  },
  infoLabel: {
    fontSize: 6,
    color: COLORS.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },

  // ── Totals / Summary ──
  totalsWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsCard: {
    width: '55%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalsHeader: {
    backgroundColor: COLORS.cardBg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  totalsHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    paddingHorizontal: 14,
  },
  totalRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  totalLabel: {
    fontSize: 8,
    color: COLORS.darkGray,
  },
  totalValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  totalDiscountLabel: {
    fontSize: 8,
    color: COLORS.green,
  },
  totalDiscountValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.green,
  },
  totalShipping: {
    fontSize: 8,
    color: COLORS.blue,
  },
  totalShippingValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.blue,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.primary,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },

  // ── Footer ──
  footerWrapper: {
    position: 'absolute',
    bottom: 28,
    left: 36,
    right: 36,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.lightGray,
    letterSpacing: 1,
  },
});

// ─────────────────────────── Types ───────────────────────────────────
interface InvoiceItem {
  title: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface InvoiceData {
  orderId: string | number;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  customerEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  transactionId?: string;
  paidAmount?: number;
  couponCode?: string;
  notes?: string;
  brandName?: string;
  brandAddress?: string;
  brandPhone?: string;
  brandEmail?: string;
  logoUrl?: string;           // Optional brand logo image URL
}

// ─────────────────────────── Helpers ─────────────────────────────────
const CURRENCY = 'Tk.';

const formatCurrency = (val: number): string =>
  `${CURRENCY} ${val.toLocaleString('en-BD')}`;

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'paid':
    case 'delivered':
    case 'completed':
      return COLORS.green;
    case 'pending':
    case 'processing':
      return COLORS.amber;
    case 'cancelled':
    case 'refunded':
    case 'failed':
      return COLORS.red;
    default:
      return COLORS.mediumGray;
  }
};

// ─────────────────────────── Document Component ──────────────────────
export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const subtotal = data.subtotal || data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = data.discount || 0;
  const shipping = data.shippingFee || 0;
  const total = data.totalAmount || subtotal - discount + shipping;

  const orderNum = data.orderNumber || `#${data.orderId}`;
  const brandName = data.brandName || 'AS SIDRAT';
  const brandTagline = 'PREMIUM FASHION & LIFESTYLE';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ──────── HEADER ──────── */}
        <View style={styles.header}>
          {/* Left — Brand Logo & Name */}
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              {/* Place logo.png (or .jpg/.webp/.svg) in the /public folder for auto-detection,
                  or provide a full URL via the logoUrl prop/settings. */}
              <Image
                style={styles.logoImage}
                src={data.logoUrl || '/logo.png'}
              />
              <View style={{ flexDirection: 'column', gap: 2 }}>
                <Text style={styles.brandName}>{brandName}</Text>
                <Text style={styles.brandTagline}>{brandTagline}</Text>
              </View>
            </View>
          </View>

          {/* Right — Invoice Badge */}
          <View style={styles.headerRight}>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>Invoice</Text>
            </View>
            <Text style={styles.invoiceNumber}>{orderNum}</Text>
          </View>
        </View>

        {/* ──────── BILL TO + INVOICE DETAILS (side-by-side cards) ──────── */}
        <View style={styles.metaRow}>
          {/* Bill To Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaAccent} />
            <View style={styles.metaContent}>
              <Text style={styles.metaLabel}>Bill To</Text>
              <Text style={styles.metaName}>{data.customerName}</Text>
              <Text style={styles.metaText}>{data.customerPhone}</Text>
              {data.customerEmail && (
                <Text style={styles.metaText}>{data.customerEmail}</Text>
              )}
              <Text style={styles.metaText}>{data.customerAddress}</Text>
              <Text style={styles.metaText}>{data.customerCity}</Text>
            </View>
          </View>

          {/* Invoice Details Card */}
          <View style={styles.metaCard}>
            <View style={styles.metaAccent} />
            <View style={styles.metaContent}>
              <Text style={styles.metaLabel}>Invoice Details</Text>
              <Text style={styles.metaText}>
                Date:{' '}
                <Text style={{ fontWeight: 'bold' }}>
                  {formatDate(data.createdAt)}
                </Text>
              </Text>
              <Text style={styles.metaText}>
                Payment:{' '}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: getStatusColor(data.paymentStatus),
                  }}
                >
                  {data.paymentStatus}
                </Text>
              </Text>
              <Text style={styles.metaText}>
                Status:{' '}
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: getStatusColor(data.orderStatus),
                  }}
                >
                  {data.orderStatus}
                </Text>
              </Text>
              {data.paidAmount !== undefined && data.paidAmount > 0 && (
                <Text style={styles.metaText}>
                  Paid:{' '}
                  <Text style={{ fontWeight: 'bold' }}>
                    {formatCurrency(data.paidAmount)}
                  </Text>
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ──────── ORDER ITEMS TABLE ──────── */}
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Item</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Total</Text>
          </View>

          {/* Table Rows */}
          {data.items.map((item, idx) => {
            const isLast = idx === data.items.length - 1;
            return (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowAlt : {},
                  isLast ? styles.tableRowLast : {},
                ]}
              >
                <View style={{ flex: 3, paddingVertical: 7, paddingHorizontal: 10 }}>
                  <Text style={{ fontSize: 8, fontWeight: 'bold', color: COLORS.charcoal }}>
                    {item.title}
                  </Text>
                  {(item.selectedSize || item.selectedColor) && (
                    <Text style={styles.tableCellVariant}>
                      {[
                        item.selectedSize ? `Size: ${item.selectedSize}` : '',
                        item.selectedColor ? `Color: ${item.selectedColor}` : '',
                      ]
                        .filter(Boolean)
                        .join(' | ')}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1, textAlign: 'center', fontWeight: 'bold' },
                  ]}
                >
                  {item.quantity}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1.2, textAlign: 'right' },
                  ]}
                >
                  {formatCurrency(item.price)}
                </Text>
                <Text
                  style={[
                    styles.tableCellBold,
                    { flex: 1.2, textAlign: 'right' },
                  ]}
                >
                  {formatCurrency(item.price * item.quantity)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ──────── PAYMENT / META INFO ROW ──────── */}
        <View style={styles.infoRow}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{data.paymentMethod}</Text>
          </View>
          {data.transactionId && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Transaction ID</Text>
              <Text style={styles.infoValue}>{data.transactionId}</Text>
            </View>
          )}
          {data.couponCode && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Coupon</Text>
              <Text style={[styles.infoValue, { color: COLORS.primary }]}>
                {data.couponCode}
              </Text>
            </View>
          )}
          {data.notes && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={[styles.infoValue, { fontSize: 7 }]}>
                {data.notes}
              </Text>
            </View>
          )}
        </View>

        {/* ──────── TOTALS / SUMMARY ──────── */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsCard}>
            {/* Summary label bar */}
            <View style={styles.totalsHeader}>
              <Text style={styles.totalsHeaderText}>Order Summary</Text>
            </View>

            {/* Subtotal */}
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>

            {/* Discount (if any) */}
            {discount > 0 && (
              <View style={[styles.totalRow, styles.totalRowBorder]}>
                <Text style={styles.totalDiscountLabel}>
                  Discount
                  {data.couponCode ? ` (${data.couponCode})` : ''}
                </Text>
                <Text style={styles.totalDiscountValue}>
                  -{formatCurrency(discount)}
                </Text>
              </View>
            )}

            {/* Shipping */}
            <View style={[styles.totalRow, styles.totalRowBorder]}>
              <Text style={styles.totalShipping}>Shipping</Text>
              <Text style={styles.totalShippingValue}>
                {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
              </Text>
            </View>

            {/* Grand Total */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* ──────── FOOTER ──────── */}
        <View style={styles.footerWrapper}>
          <View style={styles.footerDivider} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {brandName} — {data.brandAddress || 'Dhaka, Bangladesh'}
            </Text>
            <Text style={styles.footerText}>
              {data.brandPhone || '+880 1733 919 156'} |{' '}
              {data.brandEmail || 'info@assidrat.com'}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────── Data Builder ────────────────────────────
/**
 * Resolve the brand logo to a path compatible with @react-pdf/renderer.
 * - If a logoUrl is already provided, use it as-is.
 * - Otherwise, try to resolve the local public/logo.png for server-side PDF rendering.
 */
function resolveLogoUrl(order: any): string | undefined {
  if (order.logoUrl) return order.logoUrl;
  // Attempt server-side file resolution for the default logo
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'logo.png'),
      path.join(process.cwd(), 'public', 'logo.jpg'),
      path.join(process.cwd(), 'public', 'logo.webp'),
      path.join(process.cwd(), 'public', 'logo.svg'),
    ];
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) return p;
    }
  } catch {
    // Not running in Node.js or file not found — fall through
  }
  return undefined;
}

export function buildInvoiceData(
  order: any,
  overrides?: Partial<InvoiceData>
): InvoiceData {
  const items: InvoiceItem[] = (order.orderItems || []).map((item: any) => ({
    title: item.title || 'Item',
    price: item.price || 0,
    quantity: item.quantity || 1,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = order.couponDiscount || 0;
  const shipping = 0; // Shipping is baked into totalAmount in the DB

  return {
    orderId: order.orderId || order._id?.toString().slice(-6) || '',
    orderNumber: `#${order.orderId || order._id?.toString().slice(-6).toUpperCase() || ''}`,
    createdAt: order.createdAt || new Date().toISOString(),
    customerName: order.shippingInfo?.name || 'Customer',
    customerPhone: order.shippingInfo?.phone || '',
    customerAddress: order.shippingInfo?.address || '',
    customerCity: order.shippingInfo?.city || '',
    customerEmail: order.shippingInfo?.email || order.customerEmail,
    items,
    subtotal,
    discount,
    shippingFee: shipping,
    totalAmount: order.totalAmount || subtotal - discount + shipping,
    paymentMethod: order.paymentMethod || 'Cash on Delivery',
    paymentStatus: order.paymentStatus || 'Pending',
    orderStatus: order.orderStatus || 'Pending',
    transactionId: order.transactionId,
    paidAmount: order.paidAmount,
    couponCode: order.couponCode,
    notes: order.internalNotes,
    logoUrl: resolveLogoUrl(order),
    ...overrides,
  };
}
