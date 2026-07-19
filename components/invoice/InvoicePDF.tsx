import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
  },
  brandSection: {
    flexDirection: 'column',
    gap: 4,
  },
  brandName: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontSize: 8,
    color: '#666',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 6,
    textTransform: 'uppercase',
    color: '#A31F24',
  },
  invoiceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 20,
  },
  metaBlock: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
  },
  metaLabel: {
    fontSize: 7,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  metaValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  metaValueSmall: {
    fontSize: 8,
    color: '#555',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableHeaderCell: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    fontSize: 8,
    color: '#374151',
  },
  tableCellBold: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  totalsSection: {
    marginLeft: 'auto',
    width: '50%',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    fontSize: 9,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderTopWidth: 2,
    borderTopColor: '#1A1A1A',
    marginTop: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 7,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  paymentBlock: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  paymentLabel: {
    fontSize: 7,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  paymentValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});

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
}

export function InvoiceDocument({ data }: { data: InvoiceData }) {
  const subtotal = data.subtotal || data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = data.discount || 0;
  const shipping = data.shippingFee || 0;
  const total = data.totalAmount || (subtotal - discount + shipping);

  const formatCurrency = (val: number) => `৳ ${val.toLocaleString('en-BD')}`;
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': case 'Delivered': case 'Completed': return '#059669';
      case 'Pending': return '#D97706';
      case 'Cancelled': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const orderNum = data.orderNumber || `#${data.orderId}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <Text style={styles.brandName}>{data.brandName || 'AS SIDRAT'}</Text>
            <Text style={styles.brandTagline}>Premium Fashion & Lifestyle</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={{ fontSize: 8, color: '#666', marginTop: 4 }}>{orderNum}</Text>
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={styles.invoiceMeta}>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>{data.customerName}</Text>
            <Text style={styles.metaValueSmall}>{data.customerPhone}</Text>
            {data.customerEmail && <Text style={styles.metaValueSmall}>{data.customerEmail}</Text>}
            <Text style={styles.metaValueSmall}>{data.customerAddress}</Text>
            <Text style={styles.metaValueSmall}>{data.customerCity}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Invoice Details</Text>
            <Text style={styles.metaValue}>Date: {formatDate(data.createdAt)}</Text>
            <Text style={[styles.metaValueSmall, { color: getStatusColor(data.paymentStatus), fontWeight: 'bold', marginTop: 4 }]}>
              Payment: {data.paymentStatus}
            </Text>
            <Text style={[styles.metaValueSmall, { color: getStatusColor(data.orderStatus), marginTop: 2 }]}>
              Status: {data.orderStatus}
            </Text>
          </View>
        </View>

        {/* Order Items Table */}
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 3 }]}>Item</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Price</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Total</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}>
              <Text style={[styles.tableCellBold, { flex: 3 }]}>
                {item.title}
                {(item.selectedSize || item.selectedColor) && ` (${item.selectedSize || ''}${item.selectedSize && item.selectedColor ? ' / ' : ''}${item.selectedColor || ''})`}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.price)}</Text>
              <Text style={[styles.tableCellBold, { flex: 1, textAlign: 'right' }]}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <View style={styles.paymentBlock}>
            <Text style={styles.paymentLabel}>Payment Method</Text>
            <Text style={styles.paymentValue}>{data.paymentMethod}</Text>
          </View>
          {data.transactionId && (
            <View style={styles.paymentBlock}>
              <Text style={styles.paymentLabel}>Transaction ID</Text>
              <Text style={styles.paymentValue}>{data.transactionId}</Text>
            </View>
          )}
          {data.couponCode && (
            <View style={styles.paymentBlock}>
              <Text style={styles.paymentLabel}>Coupon Applied</Text>
              <Text style={[styles.paymentValue, { color: '#A31F24' }]}>{data.couponCode}</Text>
            </View>
          )}
          {data.notes && (
            <View style={styles.paymentBlock}>
              <Text style={styles.paymentLabel}>Notes</Text>
              <Text style={[styles.paymentValue, { fontSize: 8 }]}>{data.notes}</Text>
            </View>
          )}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{formatCurrency(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={{ color: '#059669' }}>Discount</Text>
              <Text style={{ color: '#059669' }}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Shipping</Text>
            <Text>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Total</Text>
            <Text style={{ color: '#A31F24' }}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {data.brandName || 'AS SIDRAT'} — {data.brandAddress || 'Dhaka, Bangladesh'}
          </Text>
          <Text style={styles.footerText}>
            {data.brandPhone || '+880 1733 919 156'} | {data.brandEmail || 'info@assidrat.com'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

/**
 * Build invoice data payload from an order object (from DB or manual input).
 */
export function buildInvoiceData(order: any, overrides?: Partial<InvoiceData>): InvoiceData {
  const items: InvoiceItem[] = (order.orderItems || []).map((item: any) => ({
    title: item.title || 'Item',
    price: item.price || 0,
    quantity: item.quantity || 1,
    selectedSize: item.selectedSize,
    selectedColor: item.selectedColor,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = order.couponDiscount || 0;
  const shipping = 0; // Shipping is baked into totalAmount in the DB, but we can allow override

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
    ...overrides,
  };
}
