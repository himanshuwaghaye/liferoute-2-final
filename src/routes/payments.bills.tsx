import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Receipt, CheckCircle2, ArrowLeft, CreditCard, ShieldCheck } from "lucide-react";
import { paymentService } from "@/services";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  LoadingBlock,
  EmptyState,
  DemoBadge,
} from "@/components/common/Primitives";

import { openRazorpayCheckout } from "@/lib/razorpay";

export const Route = createFileRoute("/payments/bills")({
  head: () => ({
    meta: [
      { title: "Hospital Bills & Invoices — LifeRoute" },
      {
        name: "description",
        content: "Review and settle verified hospital emergency bills with Razorpay.",
      },
    ],
  }),
  component: BillsPage,
});

export function BillsPage() {
  const billsQuery = useQuery({ queryKey: ["bills"], queryFn: paymentService.bills });
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const bills = billsQuery.data ?? [];

  const handlePayBill = async (billId: string, amount: number, hospital: string) => {
    setPayingBillId(billId);
    try {
      await openRazorpayCheckout({
        amount,
        hospital,
        billId,
        customerName: "Ishant Arun",
        customerEmail: "patient@liferoute.com",
        customerPhone: "+91 90000 00000",
        onSuccess: async (razorpayRes) => {
          await paymentService.create({
            billId,
            amount,
            hospital,
            method: "Razorpay / UPI",
            razorpayPaymentId: razorpayRes.razorpayPaymentId,
            razorpayOrderId: razorpayRes.razorpayOrderId,
          });
          setPaymentSuccess(billId);
          setPayingBillId(null);
        },
        onError: () => {
          setPayingBillId(null);
        },
      });
    } catch (err) {
      console.error("Razorpay settlement failed:", err);
      setPayingBillId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/payments"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to Payments Hub
        </Link>
      </div>

      <PageHeader
        title="Hospital Invoices & Bills"
        description="Detailed itemized breakdown for emergency hospital admissions and pharmacy charges."
      >
        <DemoBadge />
      </PageHeader>

      {billsQuery.isLoading ? (
        <LoadingBlock rows={3} />
      ) : bills.length === 0 ? (
        <EmptyState message="No billing records found." />
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => {
            const isSettled = bill.paid || paymentSuccess === bill.id;
            return (
              <Card
                key={bill.id}
                className={isSettled ? "border-success/30 bg-card" : "border-emergency/30"}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isSettled
                          ? "bg-success-soft text-success"
                          : "bg-emergency-soft text-emergency"
                      }`}
                    >
                      <Receipt className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">{bill.hospital}</h3>
                        <Pill tone={isSettled ? "success" : "emergency"}>
                          {isSettled ? "Paid & Settled" : "Payment Due"}
                        </Pill>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Category: {bill.category} · Invoiced: {bill.date} · Bill ID: #{bill.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Amount</span>
                      <p className="text-xl font-black text-foreground">
                        ₹{bill.amount.toLocaleString("en-IN")}
                      </p>
                    </div>

                    {!isSettled ? (
                      <Button
                        variant="emergency"
                        size="sm"
                        disabled={payingBillId === bill.id}
                        onClick={() => handlePayBill(bill.id, bill.amount, bill.hospital)}
                      >
                        <CreditCard className="h-4 w-4" />
                        {payingBillId === bill.id ? "Processing..." : "Pay Now"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-success">
                        <CheckCircle2 className="h-4 w-4" /> Receipt Generated
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
