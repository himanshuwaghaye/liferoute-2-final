import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  QrCode,
  Camera,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Building2,
  Sparkles,
} from "lucide-react";
import { paymentService } from "@/services";
import { openRazorpayCheckout } from "@/lib/razorpay";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  DemoBadge,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/payments/scan")({
  head: () => ({
    meta: [
      { title: "Scan & Pay — LifeRoute" },
      {
        name: "description",
        content: "Scan hospital billing QR codes or enter UPI ID with Razorpay.",
      },
    ],
  }),
  component: ScanPayPage,
});

const PRESET_COUNTERS = [
  {
    name: "Sunrise Multispeciality (Emergency Ward)",
    upi: "sunrisemulti@hdfcbank",
    amount: "2450",
  },
  { name: "City General Hospital (Trauma Care)", upi: "citygen.emergency@icici", amount: "890" },
  { name: "LifeRoute ALS Ambulance #LR-102", upi: "liferoute.dispatch@axisbank", amount: "1200" },
  { name: "Sunrise Pharmacy & Diagnostics", upi: "sunpharmacy@sbi", amount: "640" },
];

export function ScanPayPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [upiId, setUpiId] = useState("sunrisemulti@hdfcbank");
  const [amount, setAmount] = useState("2450");
  const [hospitalName, setHospitalName] = useState("Sunrise Multispeciality Hospital");
  const [processing, setProcessing] = useState(false);
  const [paidResult, setPaidResult] = useState<{
    amount: number;
    hospital: string;
    transactionId: string;
  } | null>(null);

  // Handle live camera stream if permitted
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraActive) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: "environment" } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch(() => {
          // Fallback to visual scanning animation if physical camera is blocked
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  const handleSelectPreset = (preset: (typeof PRESET_COUNTERS)[0]) => {
    setHospitalName(preset.name);
    setUpiId(preset.upi);
    setAmount(preset.amount);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      await openRazorpayCheckout({
        amount: Number(amount) || 1000,
        hospital: hospitalName,
        customerName: "Ishant Arun",
        customerEmail: "patient@liferoute.com",
        customerPhone: "+91 90000 00000",
        onSuccess: async (razorpayRes) => {
          const payment = await paymentService.create({
            amount: Number(amount),
            hospital: hospitalName,
            upiId,
            method: "Razorpay / UPI",
            razorpayPaymentId: razorpayRes.razorpayPaymentId,
            razorpayOrderId: razorpayRes.razorpayOrderId,
          });

          setPaidResult({
            amount: Number(amount),
            hospital: hospitalName,
            transactionId:
              razorpayRes.razorpayPaymentId ||
              (payment as { transactionId?: string }).transactionId ||
              `LR${Date.now().toString().slice(-6)}`,
          });
          setProcessing(false);
        },
        onError: () => {
          setProcessing(false);
        },
      });
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setProcessing(false);
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
        title="Scan & Pay with Razorpay"
        description="Point camera at hospital counter QR code or select an active emergency facility below."
      >
        <DemoBadge />
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Interactive Camera & QR Viewfinder */}
        <Card className="flex flex-col items-center justify-between p-6 text-center">
          <div className="w-full">
            <div className="relative mx-auto h-56 w-full max-w-xs overflow-hidden rounded-2xl border-2 border-dashed border-primary bg-slate-950/80 p-2 shadow-inner">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover rounded-xl"
                  playsInline
                  muted
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center">
                  <QrCode className="h-28 w-28 text-primary animate-pulse" />
                  <span className="mt-2 text-xs font-semibold text-primary">
                    Scanning active · Align QR code
                  </span>
                </div>
              )}
              {/* Pulsing scanline laser effect */}
              <div className="pointer-events-none absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-[bounce_2.5s_infinite]" />
            </div>

            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant={cameraActive ? "primary" : "outline"}
                size="sm"
                onClick={() => setCameraActive((prev) => !prev)}
              >
                <Camera className="h-4 w-4" />
                {cameraActive ? "Stop Camera" : "Open Camera Stream"}
              </Button>
            </div>
          </div>

          {/* Quick Counter Scan Presets */}
          <div className="mt-6 w-full text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Simulate Counter Scan (1-Click)
            </span>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PRESET_COUNTERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-colors ${
                    hospitalName === preset.name
                      ? "border-primary bg-primary-soft/40 text-foreground"
                      : "border-border bg-card/60 hover:bg-accent text-muted-foreground"
                  }`}
                >
                  <span className="font-semibold text-xs text-foreground line-clamp-1">
                    {preset.name}
                  </span>
                  <span className="text-[11px] font-bold text-primary mt-0.5">
                    ₹{preset.amount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Right: Payment Details & Razorpay Trigger */}
        <Card>
          <SectionTitle
            icon={<CreditCard className="h-4 w-4" />}
            title="Razorpay Payment Details"
            subtitle="Verified secure cashless emergency admission payment"
          />

          {paidResult ? (
            <div className="mt-6 rounded-2xl border border-success/40 bg-success-soft/30 p-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h3 className="mt-3 text-lg font-bold text-success">
                Payment of ₹{paidResult.amount.toLocaleString("en-IN")} Confirmed!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Beneficiary: {paidResult.hospital}
              </p>
              <div className="mt-3 rounded-lg bg-card/80 p-2 text-xs font-mono border border-border">
                Payment Ref: {paidResult.transactionId}
              </div>

              <div className="mt-5 flex gap-2 justify-center">
                <Button size="sm" onClick={() => navigate({ to: "/payments/history" })}>
                  View Receipt
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPaidResult(null)}>
                  Scan Another
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="facility"
                  className="text-xs font-bold uppercase text-muted-foreground"
                >
                  Hospital / Beneficiary
                </label>
                <input
                  id="facility"
                  type="text"
                  required
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-semibold"
                />
              </div>

              <div>
                <label htmlFor="vpa" className="text-xs font-bold uppercase text-muted-foreground">
                  UPI ID (VPA) / Razorpay Account
                </label>
                <input
                  id="vpa"
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="text-xs font-bold uppercase text-muted-foreground"
                >
                  Amount to Settle (INR ₹)
                </label>
                <input
                  id="amount"
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-base font-black text-emergency focus:ring-2 focus:ring-emergency"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                <span>
                  Powered by Razorpay 256-bit encrypted checkout with instant UPI QR & Card support.
                </span>
              </div>

              <Button
                type="submit"
                variant="emergency"
                className="w-full text-sm font-bold shadow-lg"
                disabled={processing || !amount || Number(amount) <= 0}
              >
                {processing ? (
                  "Opening Razorpay Gateway..."
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Pay ₹
                    {Number(amount || 0).toLocaleString("en-IN")} with Razorpay
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
