import { motion } from "framer-motion";
import { Video, MonitorPlay, Radio, Settings, Cpu, Headphones } from "lucide-react";

const services = [
  {
    icon: Video,
    title: "Live Production",
    description:
      "Full-scale live video production for events, concerts, conferences, and worship services with multi-camera setups.",
  },
  {
    icon: Radio,
    title: "Live Streaming",
    description:
      "Professional live streaming to any platform with custom graphics, switching, and real-time monitoring.",
  },
  {
    icon: MonitorPlay,
    title: "Broadcast Solutions",
    description:
      "End-to-end broadcast workflows designed and implemented for studios, venues, and houses of worship.",
  },
  {
    icon: Cpu,
    title: "Systems Integration",
    description:
      "Custom AV and broadcast system design, installation, and integration tailored to your facility's needs.",
  },
  {
    icon: Settings,
    title: "Technical Consulting",
    description:
      "Expert guidance on equipment selection, workflow optimization, and technology upgrades for your operation.",
  },
  {
    icon: Headphones,
    title: "Production Support",
    description:
      "On-site and remote technical direction, camera operation, and engineering support for your productions.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const Services = () => {
  return (
    <section id="services" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-display text-xs tracking-[0.3em] text-primary uppercase">
            What We Do
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 text-foreground">
            SERVICES
          </h2>
          <div className="w-16 h-0.5 bg-primary mx-auto mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="group bg-card border border-border p-8 hover:border-primary/40 transition-all duration-300"
            >
              <service.icon className="text-primary mb-5" size={32} strokeWidth={1.5} />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
