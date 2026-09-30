import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { History, ArrowLeft, Download, CheckCircle2, AlertCircle, Clock } from "lucide-react";
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

export const Route = createFileRoute("/payments/history")({
  head: () => ({
    meta: [
      { title: "Payment History — LifeRoute" },
      { name: "description", content: "Complete ledger of all emergency and hospital payments." },
    ],
  }),
  component: PaymentHistoryPage,
});

export function PaymentHistoryPage() {
  const paymentsQuery = useQuery({ queryKey: ["payments"], queryFn: paymentService.list });
  const payments = paymentsQuery.data ?? [];

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
        title="Payment History & Ledger"
        description="Every settled emergency transaction with cryptographic transaction proofs."
      >
        <DemoBadge />
      </PageHeader>

      {paymentsQuery.isLoading ? (
        <LoadingBlock rows={4} />
      ) : payments.length === 0 ? (
        <EmptyState message="No payment history records found." />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const isSuccess = p.status === "successful";
            const isPending = p.status === "pending";
            return (
              <Card
                key={p.id}
                className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                      isSuccess
                        ? "bg-success-soft text-success"
                        : isPending
                          ? "bg-warning-soft text-warning-foreground"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isSuccess ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isPending ? (
                      <Clock className="h-5 w-5" />
                    ) : (
                      <AlertCircle className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <h4 className="font-bold text-base text-foreground">{p.hospital}</h4>
                    <p className="text-xs text-muted-foreground">
                      Txn: <span className="font-mono text-foreground">{p.transactionId}</span> ·{" "}
                      {p.method} · {p.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <p className="text-lg font-bold">₹{p.amount.toLocaleString("en-IN")}</p>
                    <Pill tone={isSuccess ? "success" : isPending ? "warning" : "emergency"}>
                      {p.status}
                    </Pill>
                  </div>
                  {isSuccess && (
                    <Link to="/payments/receipts">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" /> Receipt
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
