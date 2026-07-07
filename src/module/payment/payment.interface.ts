export interface ICreatePayment {
  bookingId: string;
  amount: number;
  method: string;
}

export interface IConfirmPayment {
  bookingId: string;
  transactionId: string;
}
