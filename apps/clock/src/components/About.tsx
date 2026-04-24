import { motion } from "framer-motion";

const stats = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Productions" },
  { value: "100+", label: "Integrations" },
];

const About = () => {
  return (
    <section id="about" className="py-24 md:py-32 bg-secondary">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-display text-xs tracking-[0.3em] text-primary uppercase">
              About Us
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-6 text-foreground">
              ENGINEERING<br />
              <span className="text-gradient">EXCELLENCE</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Disbrow Productions is led by a seasoned broadcast video engineer with deep
              expertise in live production, systems integration, and broadcast technology.
              We partner with churches, venues, and organizations to deliver world-class
              video production and custom-engineered solutions.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              From multi-camera live events to full facility build-outs, we bring the
              technical precision and creative vision needed to make your broadcast
              stand out. Every project gets a custom strategy built for your goals and budget.
            </p>

            <div className="inline-flex items-center gap-3 bg-card border border-border px-5 py-3 mb-6">
              <span className="font-display text-xs tracking-[0.2em] text-primary uppercase font-semibold">
                ✦ Authorized Blackmagic Reseller
              </span>
            </div>

            <br />

            <a
              href="#contact"
              className="inline-block bg-primary text-primary-foreground font-display text-sm tracking-wider uppercase px-8 py-3 hover:bg-primary/90 transition-colors"
            >
              Work With Us
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border p-8 flex items-center gap-6"
                >
                  <span className="font-display text-5xl font-bold text-primary">
                    {stat.value}
                  </span>
                  <span className="font-display text-lg tracking-wider text-muted-foreground uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
