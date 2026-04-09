import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import { Send, Play, Clock, Brain, ChevronRight, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import VoiceOrb from "@/components/VoiceOrb";
import SystemStatusFeed, { type SystemFlag } from "@/components/SystemStatusFeed";
import { useProctoring } from "@/hooks/useProctoring";

interface ChatMessage {
  role: "ai" | "user" | "system";
  content: string;
  timestamp: Date;
}

const InterviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const candidateName = (location.state as any)?.candidateName || "Candidate";
  const [code, setCode] = useState(`// Welcome to your technical interview, ${candidateName}.\n// The AI interviewer will guide you through the session.\n\nfunction solution() {\n  // Write your code here\n}\n`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "ai", content: `Hello ${candidateName}! I'm your interviewer today. I'll be assessing your technical skills through a series of coding challenges. Let's start with a warm-up. Are you ready?`, timestamp: new Date() },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [language, setLanguage] = useState("javascript");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Proctoring
  const handleFlag = useCallback((flag: SystemFlag) => {
    // In production, this would send a hidden [SYSTEM_FLAG] via WebSocket to Gemini
    console.log("[SYSTEM_FLAG]", flag);
    setMessages(prev => [...prev, {
      role: "system",
      content: `[PROCTOR] ${flag.message}`,
      timestamp: flag.timestamp,
    }]);
  }, []);

  const { flags, startBrightnessMonitoring } = useProctoring({ onFlag: handleFlag });

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Camera feed
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        startBrightnessMonitoring(videoRef.current);
      }
    }).catch(() => {});
    return () => {
      const vid = videoRef.current;
      if (vid?.srcObject) {
        (vid.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, [startBrightnessMonitoring]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate AI speaking
  const simulateAIResponse = useCallback((userMsg: string) => {
    setIsSpeaking(true);
    setTimeout(() => {
      const responses = [
        "Good approach. Can you think about the edge cases? What happens with an empty input?",
        "I see you're using a brute-force method. Can you optimize this to O(n log n)?",
        "Nice! Now, let's move to a harder problem. Implement a function that detects cycles in a linked list.",
        "Interesting solution. Walk me through your thought process step by step.",
        "Let's pivot. Can you explain the time and space complexity of your approach?",
      ];
      setMessages(prev => [...prev, {
        role: "ai",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      }]);
      setIsSpeaking(false);
    }, 2000);
  }, []);

  const handleSend = () => {
    if (!userInput.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: userInput, timestamp: new Date() }]);
    simulateAIResponse(userInput);
    setUserInput("");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  const endInterview = () => {
    navigate("/evaluation", { state: { candidateName, duration: elapsedTime, flags } });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-semibold text-sm">InterviewerLens</span>
          <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 rounded bg-secondary/50">
            SESSION ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(elapsedTime)}
          </div>
          <div className="relative w-8 h-6 rounded overflow-hidden border border-border">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            <Video className="absolute inset-0 m-auto w-3 h-3 text-muted-foreground/30" />
          </div>
          <Button
            onClick={endInterview}
            size="sm"
            variant="outline"
            className="h-7 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            End Interview
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco Editor */}
        <div className="flex-1 flex flex-col border-r border-border">
          {/* Language tabs */}
          <div className="h-9 border-b border-border bg-card/40 flex items-center px-3 gap-1">
            {["javascript", "python", "typescript"].map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  language === lang
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang}
              </button>
            ))}
            <div className="ml-auto">
              <Button size="sm" variant="ghost" className="h-6 text-xs text-success gap-1">
                <Play className="w-3 h-3" /> Run
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "gutter",
                lineNumbers: "on",
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Right: AI Console */}
        <div className="w-[420px] flex flex-col bg-card/30">
          {/* Voice Orb */}
          <div className="flex flex-col items-center justify-center py-6 border-b border-border">
            <VoiceOrb isActive={isActive} isSpeaking={isSpeaking} />
            <p className="text-xs text-muted-foreground mt-8 font-mono">AI INTERVIEWER</p>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.filter(m => m.role !== "system").map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground border border-primary/20"
                    : "bg-secondary/50 text-foreground border border-border"
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* System Status */}
          <div className="px-3 pb-2">
            <SystemStatusFeed flags={flags} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your response..."
                className="flex-1 h-9 px-3 rounded-lg bg-secondary/50 border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/40"
              />
              <Button
                onClick={handleSend}
                size="sm"
                className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
