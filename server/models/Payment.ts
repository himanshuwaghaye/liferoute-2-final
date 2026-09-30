export interface IPayment {
  _id: string;
  userId: string;
  billId?: string;
  hospital: string;
  amount: number;
  date: string;
  transactionId: string;
  method: string;
  status: "successful" | "pending" | "failed";
  receiptNumber: string;
  createdAt: string;
}

export interface IBill {
  _id: string;
  userId: string;
  hospital: string;
  category: string;
  amount: number;
  date: string;
  paid: boolean;
  dueDate?: string;
  items?: { description: string; cost: number }[];
}

export const PaymentSchema = {
  name: "Payment",
  collection: "payments",
};
