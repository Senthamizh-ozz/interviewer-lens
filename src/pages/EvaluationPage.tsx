import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, Download, Shield, MessageSquare, Flame, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreCardProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const ScoreCard = ({ label, score, icon, color, delay }: ScoreCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel-strong p-6 flex flex-col items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div className="text-center">
      <p className="text-xs font-mono text-muted-foreground tracking-wider uppercase mb-2">{label}</p>
      <div className="relative w-24 h-24 mx-auto">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
          <motion.circle
            cx="50" cy="50" r="42" fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - score / 100) }}
            transition={{ delay: delay + 0.3, duration: 1.2, ease: "easeOut" }}
            className={color.includes("primary") ? "text-primary" : color.includes("warning") ? "text-warning" : "text-success"}
          />
        </svg>
        <motion.span
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.8 }}
        >
          {score}
        </motion.span>
      </div>
    </div>
  </motion.div>
);

const EvaluationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const candidateName = state?.candidateName || "Candidate";
  const duration = state?.duration || 0;
  const flagCount = state?.flags?.length || 0;

  // Simulated AI evaluation scores
  const scores = {
    grit: Math.max(40, 95 - flagCount * 5),
    communication: Math.min(95, 70 + Math.floor(Math.random() * 20)),
    integrity: Math.max(50, 100 - flagCount * 10),
  };

  const overall = Math.round((scores.grit + scores.communication + scores.integrity) / 3);

  return (
    <div className="min-h-screen p-6 relative">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">InterviewerLens</span>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> New Session
          </Button>
        </motion.div>

        {/* Candidate Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel-strong p-6 mb-8 glow-border"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Evaluation Report</h1>
              <p className="text-muted-foreground text-sm">
                Candidate: <span className="text-foreground font-medium">{candidateName}</span>
                {" · "}
                Duration: <span className="text-foreground font-mono">{Math.floor(duration / 60)}m {duration % 60}s</span>
                {" · "}
                Flags: <span className={`font-mono ${flagCount > 2 ? "text-warning" : "text-success"}`}>{flagCount}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Overall</p>
              <p className="text-4xl font-bold text-gradient">{overall}</p>
            </div>
          </div>
        </motion.div>

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <ScoreCard
            label="Grit"
            score={scores.grit}
            icon={<Flame className="w-6 h-6 text-primary-foreground" />}
            color="bg-primary/20 text-primary"
            delay={0.3}
          />
          <ScoreCard
            label="Communication"
            score={scores.communication}
            icon={<MessageSquare className="w-6 h-6 text-warning-foreground" />}
            color="bg-warning/20 text-warning"
            delay={0.5}
          />
          <ScoreCard
            label="Integrity"
            score={scores.integrity}
            icon={<Shield className="w-6 h-6 text-success-foreground" />}
            color="bg-success/20 text-success"
            delay={0.7}
          />
        </div>

        {/* Detailed Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="glass-panel p-6 space-y-4"
        >
          <h2 className="text-sm font-mono font-semibold text-muted-foreground tracking-wider uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> AI Assessment Notes
          </h2>
          <div className="space-y-3 text-sm text-foreground/80">
            <p>• Candidate demonstrated {scores.grit > 70 ? "strong" : "moderate"} persistence when facing challenging algorithmic problems.</p>
            <p>• Communication was {scores.communication > 80 ? "clear and structured" : "adequate but could be more detailed"} when explaining approach and trade-offs.</p>
            <p>• {flagCount === 0 ? "No integrity concerns were flagged during the session." : `${flagCount} proctoring flag(s) were detected — further review recommended.`}</p>
            <p>• Recommendation: <span className={`font-semibold ${overall > 75 ? "text-success" : overall > 55 ? "text-warning" : "text-destructive"}`}>
              {overall > 75 ? "Strong Hire" : overall > 55 ? "Consider for Next Round" : "Do Not Advance"}
            </span></p>
          </div>

          <div className="pt-4 border-t border-border">
            <Button variant="outline" className="border-border text-muted-foreground hover:text-foreground">
              <Download className="w-4 h-4 mr-2" /> Export Report (JSON)
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EvaluationPage;
