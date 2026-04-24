import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { defaultQuoteData, QuoteData, calculateEstimate } from "@/lib/quoteCalculator";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ServiceStep from "@/components/quote/ServiceStep";
import TechSpecsStep from "@/components/quote/TechSpecsStep";
import DurationStep from "@/components/quote/DurationStep";
import BudgetStep from "@/components/quote/BudgetStep";
import SummaryStep from "@/components/quote/SummaryStep";

const STEPS = ["Service", "Tech Specs", "Duration", "Budget", "Summary"];

const QuoteBuilder = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteData>(defaultQuoteData);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const update = (field: string, value: unknown) =>
    setData((prev) => ({ ...prev, [field]: value }));

  const canNext = (): boolean => {
    if (step === 0) return !!data.serviceType;
    if (step === 1) return true;
    if (step === 2) return !!data.duration;
    if (step === 3) return !!data.budgetRange;
    if (step === 4) return !!data.name.trim() && !!data.email.trim();
    return true;
  };

  const handleSubmit = async () => {
    if (!data.name.trim() || !data.email.trim()) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }

    setSending(true);
    const estimate = calculateEstimate(data);

    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          type: "quote",
          name: data.name,
          email: data.email,
          quoteData: {
            ...data,
            startDate: data.startDate?.toISOString(),
            endDate: data.endDate?.toISOString(),
            estimateLow: estimate.low,
            estimateHigh: estimate.high,
          },
        },
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      console.error("Quote send error:", err);
      toast({ title: "Failed to submit", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <section id="quote" className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
            <CheckCircle className="mx-auto text-primary mb-4" size={56} />
            <h2 className="font-display text-3xl font-bold tracking-wider uppercase text-foreground mb-3">Quote Submitted</h2>
            <p className="text-muted-foreground">Thank you, {data.name}! We'll review your project details and get back to you within 24 hours.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="quote" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-10">
            <span className="font-display text-xs tracking-[0.3em] text-primary uppercase">Project Estimator</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mt-2">GET A QUOTE</h2>
          </div>

          {/* Step indicator */}
          <div className="mb-2 flex justify-between text-xs text-muted-foreground font-display tracking-wider uppercase">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? "text-primary" : ""}>{s}</span>
            ))}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-1 mb-8 bg-border [&>div]:bg-primary" />

          {/* Step content */}
          <div className="bg-card border border-border p-6 md:p-8 min-h-[340px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && <ServiceStep value={data.serviceType} onChange={(v) => update("serviceType", v)} />}
                {step === 1 && (
                  <TechSpecsStep
                    cameras={data.cameras}
                    streaming={data.streaming}
                    streamingPlatform={data.streamingPlatform}
                    recordingFormat={data.recordingFormat}
                    extras={data.extras}
                    onChange={update}
                  />
                )}
                {step === 2 && (
                  <DurationStep duration={data.duration} startDate={data.startDate} endDate={data.endDate} onChange={update} />
                )}
                {step === 3 && <BudgetStep value={data.budgetRange} onChange={(v) => update("budgetRange", v)} />}
                {step === 4 && <SummaryStep data={data} onChange={update} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="font-display tracking-wider uppercase border-border"
            >
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="font-display tracking-wider uppercase glow-red"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canNext() || sending}
                className="font-display tracking-wider uppercase glow-red"
              >
                {sending ? <><Loader2 size={16} className="animate-spin mr-2" /> Sending...</> : "Submit Quote"}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteBuilder;
