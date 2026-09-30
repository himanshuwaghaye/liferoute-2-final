import { Router } from "express";
import { db } from "../db/index.js";
import { paymentVerificationService } from "../services/paymentService.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// List payments
router.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || "usr-patient-1";
  const list = Array.from(db.payments.values()).filter(
    (p) => p.userId === userId || p.userId === "usr-patient-1",
  );
  res.json(list);
});

// Generate Razorpay checkout order details
router.post("/razorpay/order", authenticate, (req: AuthenticatedRequest, res) => {
  const { amount, hospital, billId } = req.body;
  const userId = req.user?.id || "usr-patient-1";

  const order = paymentVerificationService.createRazorpayOrder({
    userId,
    billId,
    hospital: hospital || "Sunrise Multispeciality",
    amount: Number(amount) || 1000,
  });

  res.json(order);
});

// Process new payment (direct UPI or Razorpay callback)
router.post("/create", authenticate, (req: AuthenticatedRequest, res) => {
  const { amount, hospital, billId, method, upiId, razorpayPaymentId, razorpayOrderId } = req.body;
  const userId = req.user?.id || "usr-patient-1";

  const payment = paymentVerificationService.processPayment({
    userId,
    billId,
    hospital: hospital || "Sunrise Multispeciality",
    amount: Number(amount) || 1000,
    method: method || (razorpayPaymentId ? "Razorpay" : "UPI"),
    upiId,
    razorpayPaymentId,
    razorpayOrderId,
  });

  res.status(201).json(payment);
});

// Verify payment status
router.post("/verify", (req, res) => {
  const { transactionId } = req.body;
  const result = paymentVerificationService.verifyPayment(transactionId);
  res.json(result);
});

export default router;
