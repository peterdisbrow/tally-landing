import { SERVICE_OPTIONS } from "@/lib/quoteCalculator";
import { motion } from "framer-motion";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const ServiceStep = ({ value, onChange }: Props) => (
  <div className="space-y-4">
    <h3 className="font-display text-xl tracking-wider text-foreground uppercase">Select Service Type</h3>
    <div className="grid gap-3 sm:grid-cols-2">
      {SERVICE_OPTIONS.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(opt.value)}
          className={`text-left p-4 border transition-colors ${
            value === opt.value
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          <span className="font-display text-sm tracking-wider uppercase block text-foreground">{opt.label}</span>
          <span className="text-xs mt-1 block">{opt.description}</span>
        </motion.button>
      ))}
    </div>
  </div>
);

export default ServiceStep;
