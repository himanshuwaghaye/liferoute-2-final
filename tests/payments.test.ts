import { describe, it, expect } from "vitest";
import { paymentVerificationService } from "../server/services/paymentService";

describe("Payments & Billing Engine Suite", () => {
  it("creates itemized hospital bill", () => {
    const bill = paymentVerificationService.createBill({
      userId: "usr-patient-1",
      hospital: "Sunrise Multispeciality",
      category: "Emergency Trauma Care",
      amount: 3200,
    });

    expect(bill.id).toBeDefined();
    expect(bill.amount).toBe(3200);
    expect(bill.paid).toBe(false);
  });

  it("processes and verifies payment settlement", () => {
    const bill = paymentVerificationService.createBill({
      userId: "usr-patient-1",
      hospital: "City General Hospital",
      category: "Ambulance Dispatch",
      amount: 1500,
    });

    const payment = paymentVerificationService.processPayment({
      userId: "usr-patient-1",
      billId: bill.id,
      hospital: "City General Hospital",
      amount: 1500,
      method: "UPI",
    });

    expect(payment.status).toBe("successful");
    expect(payment.transactionId).toMatch(/^LR/);

    const verification = paymentVerificationService.verifyPayment(payment.transactionId);
    expect(verification.verified).toBe(true);
  });
});
