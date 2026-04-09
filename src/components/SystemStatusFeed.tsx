import { Shield, ShieldCheck, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SystemFlag {
  id: string;
  type: "gaze" | "keystroke" | "brightness" | "info";
  message: string;
  timestamp: Date;
  severity: "low" | "medium" | "high";
}

interface SystemStatusFeedProps {
  flags: SystemFlag[];
}

const severityColors: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-destructive",
};

const typeIcons: Record<string, typeof Shield> = {
  gaze: Shield,
  keystroke: Activity,
  brightness: Shield,
  info: ShieldCheck,
};

const SystemStatusFeed = ({ flags }: SystemStatusFeedProps) => {
  return (
    <div className="glass-panel p-3 space-y-1 max-h-40 overflow-y-auto">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-success" />
        <span className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase">
          System Status
        </span>
      </div>
      <AnimatePresence>
        {flags.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground/60">All systems nominal.</p>
        ) : (
          flags.slice(-5).map((flag) => {
            const Icon = typeIcons[flag.type] || Shield;
            return (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-2 text-xs font-mono"
              >
                <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${severityColors[flag.severity]}`} />
                <span className="text-muted-foreground/80">{flag.message}</span>
                <span className="ml-auto text-muted-foreground/40 shrink-0">
                  {flag.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemStatusFeed;
