import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  QrCode,
  Receipt,
  History,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { paymentService } from "@/services";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  LoadingBlock,
  DemoBadge,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/payments/")({
  head: () => ({
    meta: [
      { title: "Payments & Medical Billing — LifeRoute" },
      {
        name: "description",
        content: "Instant emergency healthcare billing, UPI scanner, and settlement history.",
      },
    ],
  }),
  component: PaymentsIndexPage,
});

export function PaymentsIndexPage() {
  const paymentsQuery = useQuery({ queryKey: ["payments"], queryFn: paymentService.list });
  const billsQuery = useQuery({ queryKey: ["bills"], queryFn: paymentService.bills });

  const payments = paymentsQuery.data ?? [];
  const bills = billsQuery.data ?? [];
  const unpaidBills = bills.filter((b) => !b.paid);
  const totalOutstanding = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Healthcare Billing"
        description="Transparent emergency hospital billing and instant cashless settlements."
      >
        <DemoBadge />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col justify-between p-5 bg-card border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Outstanding Bills
          </span>
          <p className="mt-2 text-3xl font-extrabold text-emergency">
            ₹{totalOutstanding.toLocaleString("en-IN")}
          </p>
          <div className="mt-4">
            <Link to="/payments/bills">
              <Button size="sm" variant="emergency" className="w-full">
                Pay Outstanding ({unpaidBills.length})
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 bg-card border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quick UPI Scanner
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            Scan hospital emergency admission or ambulance QR codes instantly.
          </p>
          <div className="mt-4">
            <Link to="/payments/scan">
              <Button size="sm" variant="outline" className="w-full">
                <QrCode className="h-4 w-4" /> Scan Hospital QR
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-5 bg-card border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Settlement History
          </span>
          <p className="mt-2 text-sm text-muted-foreground">
            Verified server transactions and downloadable tax invoices.
          </p>
          <div className="mt-4">
            <Link to="/payments/history">
              <Button size="sm" variant="outline" className="w-full">
                <History className="h-4 w-4" /> View All ({payments.length})
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle
            icon={<Receipt className="h-4 w-4" />}
            title="Pending Hospital Bills"
            action={
              <Link to="/payments/bills" className="text-xs font-semibold text-primary">
                View all
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            {billsQuery.isLoading ? (
              <LoadingBlock rows={2} />
            ) : unpaidBills.length === 0 ? (
              <div className="rounded-xl bg-success-soft p-4 text-center text-sm font-semibold text-success flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> All hospital bills are settled!
              </div>
            ) : (
              unpaidBills.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-bold">{bill.hospital}</p>
                    <p className="text-xs text-muted-foreground">
                      {bill.category} · {bill.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">₹{bill.amount.toLocaleString("en-IN")}</p>
                    <Link to="/payments/bills">
                      <span className="text-xs font-semibold text-emergency hover:underline">
                        Pay now
                      </span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={<CreditCard className="h-4 w-4" />}
            title="Recent Transactions"
            action={
              <Link to="/payments/history" className="text-xs font-semibold text-primary">
                All records
              </Link>
            }
          />
          <div className="mt-4 space-y-3">
            {paymentsQuery.isLoading ? (
              <LoadingBlock rows={2} />
            ) : (
              payments.slice(0, 3).map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
                >
                  <div>
                    <p className="font-bold">{pay.hospital}</p>
                    <p className="text-xs text-muted-foreground">
                      {pay.method} · Ref: {pay.transactionId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{pay.amount.toLocaleString("en-IN")}</p>
                    <Pill
                      tone={
                        pay.status === "successful"
                          ? "success"
                          : pay.status === "pending"
                            ? "warning"
                            : "emergency"
                      }
                    >
                      {pay.status}
                    </Pill>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="bg-muted/30">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              PCI-DSS Compliant & RBI Tokenized:{" "}
            </span>
            LifeRoute does not store raw credit card numbers or banking passwords. All payments are
            verified asynchronously by the banking switch.
          </div>
        </div>
      </Card>
    </div>
  );
}
