import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  ShieldCheck,
  Download,
  Share2,
  Filter,
  AlertCircle,
} from "lucide-react";
import { medicalRecordService } from "@/services";
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

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Medical Records Vault — LifeRoute" },
      {
        name: "description",
        content: "Secure personal medical records, allergy profiles, and lab reports.",
      },
    ],
  }),
  component: MedicalRecordsPage,
});

export function MedicalRecordsPage() {
  const [filterSection, setFilterSection] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newRecordModal, setNewRecordModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSection, setNewSection] = useState("Lab Reports");
  const [newProvider, setNewProvider] = useState("");

  const recordsQuery = useQuery({
    queryKey: ["medical-records"],
    queryFn: medicalRecordService.list,
  });

  const sections = [
    "All",
    "Lab Reports",
    "Medical Images",
    "Medical History",
    "Allergies",
    "Prescriptions",
    "Emergency History",
    "Doctor Reports",
    "Hospital Visits",
  ];

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await medicalRecordService.create({
      title: newTitle,
      section: newSection,
      provider: newProvider || "Self Upload",
      date: new Date().toISOString().split("T")[0],
      status: "Final",
    });
    setNewTitle("");
    setNewProvider("");
    setNewRecordModal(false);
    recordsQuery.refetch();
  };

  const records = recordsQuery.data ?? [];
  const filtered = records.filter((r) => {
    const matchesSection = filterSection === "All" || r.section === filterSection;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSection && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medical Records Vault"
        description="Encrypted personal health records attached to emergency response workflows."
      >
        <div className="flex items-center gap-2">
          <DemoBadge />
          <Button size="sm" onClick={() => setNewRecordModal(true)}>
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-muted-foreground">Total Documents</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emergency-soft text-emergency">
            <AlertCircle className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">2 Allergies</p>
            <p className="text-xs text-muted-foreground">Penicillin, Dust mite</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-success-soft text-success">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-2xl font-bold">Encrypted</p>
            <p className="text-xs text-muted-foreground">End-to-End HIPAA/ABDM</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search records, doctors, lab tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {sections.slice(0, 5).map((sec) => (
            <button
              key={sec}
              onClick={() => setFilterSection(sec)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                filterSection === sec
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card hover:bg-accent text-foreground"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {newRecordModal && (
        <Card className="border-primary/40">
          <SectionTitle
            title="Add New Medical Document"
            subtitle="Upload health record or diagnostic report"
          />
          <form onSubmit={handleAddRecord} className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lipid Profile Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Section Category
                </label>
                <select
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
                >
                  {sections
                    .filter((s) => s !== "All")
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Hospital / Physician / Lab
              </label>
              <input
                type="text"
                placeholder="e.g. Sunrise Multispeciality"
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                Save Document
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setNewRecordModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {recordsQuery.isLoading ? (
        <LoadingBlock rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No medical records found."
          hint="Try adjusting your filter or add a new record."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((record) => (
            <Card
              key={record.id}
              className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="font-bold text-base text-foreground">{record.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {record.section} · {record.provider} · {record.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Pill tone={record.status === "Final" ? "success" : "muted"}>{record.status}</Pill>
                <Button variant="ghost" size="sm" aria-label="Download Document">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" aria-label="Share with Emergency Crew">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
