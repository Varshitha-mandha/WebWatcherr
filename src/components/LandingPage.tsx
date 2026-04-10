import { motion } from "framer-motion";
import { Activity, Bell, GitCompare, BarChart3, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-Time Detection",
    description: "Instantly detect changes on any website with intelligent monitoring and comparison algorithms.",
  },
  {
    icon: GitCompare,
    title: "Version Tracking",
    description: "Keep a complete history of every change with side-by-side version comparison.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified with sound alerts when major changes are detected on your tracked websites.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Visualize response times, change frequency, and uptime with interactive charts.",
  },
  {
    icon: Shield,
    title: "Reliability Monitoring",
    description: "Track status codes and response times to ensure your websites stay online.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    description: "Add any URL and start monitoring in seconds. No configuration needed.",
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(187 92% 41%)" }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
            <Activity className="w-4 h-4" />
            Intelligent Website Monitoring
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Website Change</span>
            <br />
            <span className="gradient-text">Detection System</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track, detect, and analyze website changes automatically. Get real-time alerts when content changes on any website you monitor.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            className="px-8 py-4 rounded-xl font-semibold text-primary-foreground text-lg transition-all animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, hsl(187 92% 41%), hsl(217 91% 60%))" }}
          >
            Get Started →
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 text-muted-foreground"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to monitor the web
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed for developers, marketers, and security teams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 hover:border-primary/40 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
