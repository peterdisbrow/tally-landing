import { BUDGET_OPTIONS } from "@/lib/quoteCalculator";
import { motion } from "framer-motion";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

const BudgetStep = ({ value, onChange }: Props) => (
  <div className="space-y-4">
    <h3 className="font-display text-xl tracking-wider text-foreground uppercase">Budget Range</h3>
    <p className="text-sm text-muted-foreground">Select the range that best fits your project budget.</p>
    <div className="grid gap-3">
      {BUDGET_OPTIONS.map((opt) => (
        <motion.button
          key={opt.value}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onChange(opt.value)}
          className={`text-left p-4 border transition-colors font-display tracking-wider text-sm uppercase ${
            value === opt.value
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
          }`}
        >
          {opt.label}
        </motion.button>
      ))}
    </div>
  </div>
);

export default BudgetStep;
