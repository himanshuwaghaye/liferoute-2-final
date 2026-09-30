import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ArrowLeft, Printer, CheckCircle2 } from "lucide-react";
import { DEMO_USER } from "@/data/mock";
import { Button, Card, PageHeader, Pill, SectionTitle } from "@/components/common/Primitives";

export const Route = createFileRoute("/payments/receipts")({
  head: () => ({
    meta: [
      { title: "Payment Receipts & Tax Invoices — LifeRoute" },
      {
        name: "description",
        content: "Official GST tax receipts and payment verification records.",
      },
    ],
  }),
  component: ReceiptsPage,
});

export function ReceiptsPage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
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
        title="Official Payment Receipt"
        description="GST & Section 80D compliant medical expenditure invoice."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </PageHeader>

      <Card className="max-w-2xl mx-auto border-border p-6 sm:p-8 bg-card">
        <div className="flex items-start justify-between border-b border-border pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emergency text-emergency-foreground font-black text-sm">
                LR
              </span>
              <span className="font-display font-extrabold text-xl">LifeRoute Health</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              GSTIN: 27AABCL8419Q1ZM · Reg #MH-MED-2026-99
            </p>
          </div>
          <div className="text-right">
            <Pill tone="success">Paid & Verified</Pill>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Receipt #: LR-REC-2026-8819
            </p>
            <p className="text-xs text-muted-foreground">Date: 14 Aug 2026</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold uppercase text-muted-foreground">Billed To (Patient)</span>
            <p className="mt-1 font-bold text-sm text-foreground">{DEMO_USER.fullName}</p>
            <p className="text-muted-foreground">
              Blood Group: {DEMO_USER.bloodGroup} · Age: {DEMO_USER.age}
            </p>
          </div>
          <div>
            <span className="font-bold uppercase text-muted-foreground">Healthcare Provider</span>
            <p className="mt-1 font-bold text-sm text-foreground">
              Sunrise Multispeciality Hospital
            </p>
            <p className="text-muted-foreground">Emergency & Trauma Care Unit</p>
          </div>
        </div>

        <div className="mt-6 border-t border-border pt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted-foreground">
                <th className="pb-2">Description</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2.5">Emergency ALS Ambulance Dispatch & Paramedic Support</td>
                <td className="py-2.5 text-right font-medium">₹1,800.00</td>
              </tr>
              <tr>
                <td className="py-2.5">Emergency Triage & Vital Signs Stabilization</td>
                <td className="py-2.5 text-right font-medium">₹650.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold">
                <td className="pt-3">Total Paid</td>
                <td className="pt-3 text-right text-lg text-foreground">₹2,450.00</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6 rounded-xl bg-muted/40 p-3 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Payment Gateway: UPI (Txn: LR9F2K81QA)</span>
          <span className="flex items-center gap-1 text-success font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Settled
          </span>
        </div>
      </Card>
    </div>
  );
}
