import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FORMAT_OPTIONS, EXTRAS_OPTIONS } from "@/lib/quoteCalculator";

interface Props {
  cameras: number;
  streaming: boolean;
  streamingPlatform: string;
  recordingFormat: string;
  extras: string[];
  onChange: (field: string, value: unknown) => void;
}

const PLATFORMS = ["YouTube", "Facebook", "Twitch", "Vimeo", "Custom RTMP"];

const TechSpecsStep = ({ cameras, streaming, streamingPlatform, recordingFormat, extras, onChange }: Props) => (
  <div className="space-y-6">
    <h3 className="font-display text-xl tracking-wider text-foreground uppercase">Technical Specs</h3>

    {/* Cameras */}
    <div className="space-y-2">
      <Label className="font-display tracking-wider uppercase text-sm">Cameras: {cameras}</Label>
      <Slider
        min={1} max={10} step={1}
        value={[cameras]}
        onValueChange={([v]) => onChange("cameras", v)}
        className="py-2"
      />
    </div>

    {/* Streaming */}
    <div className="flex items-center gap-3">
      <Switch checked={streaming} onCheckedChange={(v) => onChange("streaming", v)} />
      <Label className="font-display tracking-wider uppercase text-sm">Live Streaming Required</Label>
    </div>
    {streaming && (
      <Select value={streamingPlatform} onValueChange={(v) => onChange("streamingPlatform", v)}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          {PLATFORMS.map((p) => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}

    {/* Recording format */}
    <div className="space-y-2">
      <Label className="font-display tracking-wider uppercase text-sm">Recording Format</Label>
      <Select value={recordingFormat} onValueChange={(v) => onChange("recordingFormat", v)}>
        <SelectTrigger className="bg-card border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border z-50">
          {FORMAT_OPTIONS.map((f) => (
            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Extras */}
    <div className="space-y-3">
      <Label className="font-display tracking-wider uppercase text-sm">Additional Equipment</Label>
      <div className="grid grid-cols-2 gap-3">
        {EXTRAS_OPTIONS.map((ext) => (
          <label key={ext.value} className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={extras.includes(ext.value)}
              onCheckedChange={(checked) => {
                const next = checked
                  ? [...extras, ext.value]
                  : extras.filter((e) => e !== ext.value);
                onChange("extras", next);
              }}
            />
            <span className="text-sm text-muted-foreground">{ext.label}</span>
          </label>
        ))}
      </div>
    </div>
  </div>
);

export default TechSpecsStep;
