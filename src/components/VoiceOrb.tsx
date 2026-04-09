import { motion } from "framer-motion";

interface VoiceOrbProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const VoiceOrb = ({ isActive, isSpeaking }: VoiceOrbProps) => {
  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      {/* Outer rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full border border-primary/20 orb-ring" />
          <div className="absolute inset-2 rounded-full border border-primary/15 orb-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute inset-4 rounded-full border border-primary/10 orb-ring" style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Glow backdrop */}
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-primary/10 blur-xl"
        animate={{
          scale: isSpeaking ? [1, 1.3, 1] : isActive ? [1, 1.05, 1] : 1,
          opacity: isSpeaking ? [0.3, 0.6, 0.3] : isActive ? 0.2 : 0.1,
        }}
        transition={{ duration: isSpeaking ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Core orb */}
      <motion.div
        className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 shadow-lg"
        style={{ boxShadow: '0 0 30px hsl(var(--primary) / 0.3)' }}
        animate={{
          scale: isSpeaking ? [1, 1.12, 0.95, 1.08, 1] : isActive ? [1, 1.03, 1] : 1,
        }}
        transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner highlight */}
        <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-primary/40 blur-sm" />
      </motion.div>

      {/* Status label */}
      <div className="absolute -bottom-6 text-xs font-mono text-muted-foreground">
        {isSpeaking ? "SPEAKING" : isActive ? "LISTENING" : "STANDBY"}
      </div>
    </div>
  );
};

export default VoiceOrb;
