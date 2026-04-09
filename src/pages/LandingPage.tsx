import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, Mic, MicOff, CameraOff, ArrowRight, Shield, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const LandingPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [checking, setChecking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkDevices = async () => {
    setChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOk(true);
      setMicOk(true);
    } catch {
      // Try individually
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraOk(true);
      } catch { setCameraOk(false); }
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicOk(true);
      } catch { setMicOk(false); }
    }
    setChecking(false);
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleJoin = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    navigate("/interview", { state: { candidateName: name } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Interviewer<span className="text-gradient">Lens</span>
            </span>
          </motion.div>
          <p className="text-muted-foreground text-sm">
            AI-Powered Technical Interview Platform
          </p>
        </div>

        {/* Main Card */}
        <div className="glass-panel-strong p-8 glow-border space-y-6">
          <div>
            <label className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase mb-2 block">
              Candidate Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-secondary/50 border-border focus:border-primary/50 h-11"
            />
          </div>

          {/* Camera Preview */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-semibold text-muted-foreground tracking-wider uppercase block">
              Device Check
            </label>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary/30 border border-border">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraOk ? 'opacity-100' : 'opacity-0'}`}
              />
              {!cameraOk && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CameraOff className="w-8 h-8 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={checkDevices}
                disabled={checking}
                variant="outline"
                className="flex-1 h-10 border-border bg-secondary/30 hover:bg-secondary/60 text-foreground"
              >
                {checking ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Zap className="w-4 h-4 mr-2" />
                  </motion.div>
                ) : (
                  <Camera className="w-4 h-4 mr-2" />
                )}
                Check Devices
              </Button>

              <div className="flex items-center gap-2 px-3 rounded-lg border border-border bg-secondary/20">
                {cameraOk ? (
                  <Camera className="w-4 h-4 text-success" />
                ) : (
                  <CameraOff className="w-4 h-4 text-muted-foreground/40" />
                )}
                {micOk ? (
                  <Mic className="w-4 h-4 text-success" />
                ) : (
                  <MicOff className="w-4 h-4 text-muted-foreground/40" />
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleJoin}
            disabled={!name.trim() || !cameraOk || !micOk}
            className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-sm tracking-wide"
          >
            Join Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground/50">
          <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> E2E Encrypted</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> AI-Proctored</span>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
