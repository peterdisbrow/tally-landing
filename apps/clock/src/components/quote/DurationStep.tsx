import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DURATION_OPTIONS } from "@/lib/quoteCalculator";
import { motion } from "framer-motion";

interface Props {
  duration: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onChange: (field: string, value: unknown) => void;
}

const DurationStep = ({ duration, startDate, endDate, onChange }: Props) => (
  <div className="space-y-6">
    <h3 className="font-display text-xl tracking-wider text-foreground uppercase">Duration & Dates</h3>

    <div className="space-y-2">
      <Label className="font-display tracking-wider uppercase text-sm">Project Duration</Label>
      <div className="grid grid-cols-2 gap-3">
        {DURATION_OPTIONS.map((opt) => (
          <motion.button
            key={opt.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange("duration", opt.value)}
            className={`p-3 border text-sm font-display tracking-wider uppercase transition-colors ${
              duration === opt.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
            }`}
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="font-display tracking-wider uppercase text-sm">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left bg-card border-border", !startDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
            <Calendar mode="single" selected={startDate} onSelect={(d) => onChange("startDate", d)} className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label className="font-display tracking-wider uppercase text-sm">End Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left bg-card border-border", !endDate && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-popover border-border z-50" align="start">
            <Calendar mode="single" selected={endDate} onSelect={(d) => onChange("endDate", d)} className={cn("p-3 pointer-events-auto")} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  </div>
);

export default DurationStep;
