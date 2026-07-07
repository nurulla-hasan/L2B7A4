declare module "sslcommerz-lts" {
  interface SSLCommerzInitResponse {
    status: string;
    failedreason: string | null;
    GatewayPageURL: string;
    store_amount: string;
    tran_id: string;
    val_id: string;
    [key: string]: unknown;
  }

  interface SSLCommerzInitData {
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;
    shipping_method: string;
    product_name: string;
    product_category: string;
    product_profile: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_state: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    cus_fax?: string;
    ship_name?: string;
    ship_add1?: string;
    ship_city?: string;
    ship_state?: string;
    ship_postcode?: string;
    ship_country?: string;
  }

  class SSLCommerzPayment {
    constructor(storeId: string, storePassword: string, isLive: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzInitResponse>;
    validate(data: { val_id: string }): Promise<Record<string, unknown>>;
    transactionQueryByTransactionId(data: {
      tran_id: string;
    }): Promise<Record<string, unknown>>;
  }

  export default SSLCommerzPayment;
}
