import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuoteData, calculateEstimate, SERVICE_OPTIONS, DURATION_OPTIONS, FORMAT_OPTIONS, EXTRAS_OPTIONS, BUDGET_OPTIONS } from "@/lib/quoteCalculator";

interface Props {
  data: QuoteData;
  onChange: (field: string, value: unknown) => void;
}

const lookup = (options: { value: string; label: string }[], val: string) =>
  options.find((o) => o.value === val)?.label || val;

const SummaryStep = ({ data, onChange }: Props) => {
  const estimate = calculateEstimate(data);

  return (
    <div className="space-y-6">
      <h3 className="font-display text-xl tracking-wider text-foreground uppercase">Summary & Estimate</h3>

      {/* Estimate */}
      <div className="bg-primary/10 border border-primary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-display mb-1">Estimated Range</p>
        <p className="font-display text-3xl font-bold text-foreground">
          ${estimate.low.toLocaleString()} – ${estimate.high.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground mt-2">This is a ballpark estimate, not a binding quote.</p>
      </div>

      {/* Selections summary */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <SummaryRow label="Service" value={lookup(SERVICE_OPTIONS, data.serviceType)} />
        <SummaryRow label="Cameras" value={String(data.cameras)} />
        <SummaryRow label="Format" value={lookup(FORMAT_OPTIONS, data.recordingFormat)} />
        <SummaryRow label="Streaming" value={data.streaming ? (data.streamingPlatform || "Yes") : "No"} />
        <SummaryRow label="Duration" value={lookup(DURATION_OPTIONS, data.duration)} />
        <SummaryRow label="Budget" value={lookup(BUDGET_OPTIONS, data.budgetRange)} />
        {data.extras.length > 0 && (
          <div className="sm:col-span-2">
            <SummaryRow label="Extras" value={data.extras.map((e) => lookup(EXTRAS_OPTIONS, e)).join(", ")} />
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h4 className="font-display text-sm tracking-wider uppercase text-foreground">Contact Information</h4>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Name *</Label>
            <Input value={data.name} onChange={(e) => onChange("name", e.target.value)} className="bg-card border-border" placeholder="Your name" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Email *</Label>
            <Input type="email" value={data.email} onChange={(e) => onChange("email", e.target.value)} className="bg-card border-border" placeholder="you@company.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Phone</Label>
            <Input value={data.phone} onChange={(e) => onChange("phone", e.target.value)} className="bg-card border-border" placeholder="(555) 123-4567" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Company</Label>
            <Input value={data.company} onChange={(e) => onChange("company", e.target.value)} className="bg-card border-border" placeholder="Company name" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border/50 pb-2">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

export default SummaryStep;
