export interface SslCommerzConfig {
  storeId: string;
  storePassword: string;
  isSandbox: boolean;
}

export function getSslCommerzConfig(): SslCommerzConfig {
  return {
    storeId: process.env.SSLCOMMERZ_STORE_ID || 'your_store_id',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'your_store_password',
    isSandbox: process.env.SSLCOMMERZ_ENV !== 'production'
  };
}

export function getSslCommerzEndpoint(path: string) {
  const host = getSslCommerzConfig().isSandbox ? 'https://sandbox.sslcommerz.com' : 'https://securepay.sslcommerz.com';
  return `${host}${path}`;
}
