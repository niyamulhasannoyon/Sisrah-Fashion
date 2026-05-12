interface SSLCommerzFormProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerPhone: string;
}

export function SSLCommerzForm({ orderId, amount, customerEmail, customerPhone }: SSLCommerzFormProps) {
  return (
    <form action="/api/payments" method="post" className="space-y-4">
      <input type="hidden" name="action" value="ssl-init" />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="amount" value={amount} />
      <input type="hidden" name="customerEmail" value={customerEmail} />
      <input type="hidden" name="customerPhone" value={customerPhone} />
      <button type="submit" className="w-full rounded-full bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-800">
        Pay with SSLCommerz
      </button>
    </form>
  );
}
