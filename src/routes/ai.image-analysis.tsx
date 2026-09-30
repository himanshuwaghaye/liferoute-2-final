import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Image as ImageIcon,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { aiService } from "@/services";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  LoadingBlock,
} from "@/components/common/Primitives";
import type { AiAssessment } from "@/types";

export const Route = createFileRoute("/ai/image-analysis")({
  head: () => ({
    meta: [
      { title: "AI Image Triage — LifeRoute" },
      {
        name: "description",
        content: "AI image analysis for trauma, visible injuries, and rash assessment.",
      },
    ],
  }),
  component: AiImageAnalysisPage,
});

export function AiImageAnalysisPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAssessment | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);

    try {
      // Convert file to Base64 for Google AI Vision analysis
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(selectedFile);
      });

      const base64Data = await base64Promise;

      const res = await aiService.imageAnalysis({
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        notes,
        imageBase64: base64Data,
        mimeType: selectedFile.type || "image/jpeg",
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/ai"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to AI Hub
        </Link>
      </div>

      <PageHeader
        title="AI Medical Image Triage"
        description="Upload or take a photo of an external condition (cut, burn, swelling, bruise) for visual triage."
      >
        <Pill tone="ai">Vision AI</Pill>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card as="section">
          <SectionTitle
            icon={<ImageIcon className="h-4 w-4" />}
            title="Image Upload"
            subtitle="JPG, PNG, WebP up to 10MB"
          />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 hover:bg-accent/40 transition-colors">
              {previewUrl ? (
                <div className="relative w-full max-h-60 overflow-hidden rounded-xl">
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                    <Upload className="h-6 w-6" />
                  </span>
                  <p className="mt-3 text-sm font-semibold">Select or capture photo</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ensure good lighting and focused image
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                  <Upload className="h-4 w-4" /> Browse File
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent">
                  <Camera className="h-4 w-4" /> Take Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-semibold">
                Context / Location of Injury
              </label>
              <input
                id="notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Left ankle after twisting during running, sharp pain"
                className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              variant="ai"
              className="w-full"
              disabled={loading || !selectedFile}
            >
              {loading ? (
                "Analyzing Image..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Analyze with Vision AI
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Processing visual markers...
              </h3>
              <div className="mt-4">
                <LoadingBlock rows={4} />
              </div>
            </Card>
          ) : result ? (
            <Card className="border-ai/30">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{result.category}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confidence: {result.confidence}
                  </p>
                </div>
                <Pill tone="warning">{result.urgency} Urgency</Pill>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Visual Observations
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {result.warningSigns.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Suggested Department:</span>
                    <p className="mt-0.5 font-bold text-foreground text-sm">{result.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Consult Specialist:</span>
                    <p className="mt-0.5 font-bold text-foreground text-sm">{result.specialist}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Photos are processed in memory on our secure server for evaluation and not shared
                  publicly.
                </div>
              </div>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ai-soft text-ai">
                <ImageIcon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold">No Image Analyzed</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Upload or capture a photo of the affected area to receive visual triage findings.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
