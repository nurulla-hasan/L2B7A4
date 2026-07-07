export interface ICreatePayment {
  bookingId: string;
  amount: number;
}

export interface IConfirmPayment {
  bookingId: string;
  transactionId: string;
}

export interface ISSLCommerzInitResponse {
  status: string;
  failedreason: string | null;
  GatewayPageURL: string;
  store_amount: string;
}