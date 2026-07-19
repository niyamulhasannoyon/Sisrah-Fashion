export interface SslCommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
}

export function getSslCommerzConfig(): SslCommerzConfig {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;

  if (!storeId || !storePassword) {
    throw new Error('SSLCommerz credentials not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD environment variables.');
  }

  return {
    storeId,
    storePassword,
    isSandbox: process.env.SSLCOMMERZ_ENV !== 'production'
  };
}

export function getSslCommerzEndpoint(path: string) {
  const host = getSslCommerzConfig().isSandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';
  return `${host}${path}`;
}
