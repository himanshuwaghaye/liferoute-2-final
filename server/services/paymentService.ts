import { db, type DBPayment, type DBBill } from "../db/index.js";

export class PaymentVerificationService {
  private razorpayKeyId: string;

  constructor() {
    this.razorpayKeyId = process.env["RAZORPAY_KEY_ID"] || "rzp_test_Ti7CTJGDHb9VV4";
  }

  createBill(payload: {
    userId: string;
    hospital: string;
    category: string;
    amount: number;
  }): DBBill {
    const id = `bill-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const bill: DBBill = {
      id,
      userId: payload.userId,
      hospital: payload.hospital,
      category: payload.category,
      amount: payload.amount,
      date: new Date().toISOString().split("T")[0]!,
      paid: false,
    };
    db.bills.set(id, bill);
    return bill;
  }

  createRazorpayOrder(payload: {
    amount: number;
    billId?: string;
    hospital: string;
    userId: string;
  }) {
    const orderId = `order_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    return {
      orderId,
      keyId: this.razorpayKeyId,
      amount: payload.amount * 100, // Amount in paise
      currency: "INR",
      name: "LifeRoute Emergency Healthcare",
      description: `Emergency medical bill payment - ${payload.hospital}`,
      prefill: {
        name: "LifeRoute Patient",
        email: "patient@liferoute.com",
        contact: "+91 90000 00000",
      },
      notes: {
        billId: payload.billId || "direct_emergency",
        hospital: payload.hospital,
        userId: payload.userId,
      },
    };
  }

  processPayment(payload: {
    userId: string;
    billId?: string;
    hospital: string;
    amount: number;
    method?: string;
    upiId?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
  }): DBPayment {
    const transactionId =
      payload.razorpayPaymentId ||
      `LR${Math.random().toString(36).substring(2, 8).toUpperCase()}${Math.floor(10 + Math.random() * 90)}`;
    const id = `pay-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const payment: DBPayment = {
      id,
      userId: payload.userId,
      hospital: payload.hospital,
      amount: payload.amount,
      date: new Date().toISOString().split("T")[0]!,
      transactionId,
      method: payload.method || "Razorpay / UPI",
      status: "successful",
    };

    db.payments.set(id, payment);

    if (payload.billId) {
      const bill = db.bills.get(payload.billId);
      if (bill) {
        bill.paid = true;
        db.bills.set(payload.billId, bill);
      }
    }

    db.logAudit({
      userId: payload.userId,
      action: "PAYMENT_SETTLED_RAZORPAY",
      resourceType: "PAYMENT",
      resourceId: id,
      details: {
        transactionId,
        amount: payload.amount,
        hospital: payload.hospital,
        razorpayPaymentId: payload.razorpayPaymentId,
      },
    });

    return payment;
  }

  verifyPayment(transactionId: string): { verified: boolean; payment?: DBPayment } {
    const payment = Array.from(db.payments.values()).find((p) => p.transactionId === transactionId);
    if (!payment) return { verified: false };
    return { verified: payment.status === "successful", payment };
  }
}

export const paymentVerificationService = new PaymentVerificationService();
