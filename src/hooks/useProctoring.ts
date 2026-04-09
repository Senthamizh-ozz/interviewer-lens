import { useCallback, useEffect, useRef, useState } from "react";
import type { SystemFlag } from "@/components/SystemStatusFeed";

interface ProctoringConfig {
  onFlag: (flag: SystemFlag) => void;
}

export function useProctoring({ onFlag }: ProctoringConfig) {
  const keystrokeTimestamps = useRef<number[]>([]);
  const fastKeystrokeCount = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lastBrightness = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const brightnessInterval = useRef<ReturnType<typeof setInterval>>();
  const [flags, setFlags] = useState<SystemFlag[]>([]);

  const addFlag = useCallback((type: SystemFlag["type"], message: string, severity: SystemFlag["severity"]) => {
    const flag: SystemFlag = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      severity,
    };
    setFlags(prev => [...prev, flag]);
    onFlag(flag);
  }, [onFlag]);

  // Blur / focus detection (gaze proxy)
  useEffect(() => {
    const handleBlur = () => {
      addFlag("gaze", "Focus left browser window", "medium");
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [addFlag]);

  // Keystroke DNA
  useEffect(() => {
    const handleKeydown = () => {
      const now = performance.now();
      const timestamps = keystrokeTimestamps.current;
      if (timestamps.length > 0) {
        const flightTime = now - timestamps[timestamps.length - 1];
        if (flightTime < 10) {
          fastKeystrokeCount.current++;
          if (fastKeystrokeCount.current >= 5) {
            addFlag("keystroke", "Rapid input detected — potential paste", "high");
            fastKeystrokeCount.current = 0;
          }
        } else {
          fastKeystrokeCount.current = Math.max(0, fastKeystrokeCount.current - 1);
        }
      }
      timestamps.push(now);
      if (timestamps.length > 50) timestamps.shift();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [addFlag]);

  // Luma-Shift detection
  const startBrightnessMonitoring = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 64;
      canvasRef.current.height = 48;
    }

    brightnessInterval.current = setInterval(() => {
      const canvas = canvasRef.current;
      const vid = videoRef.current;
      if (!canvas || !vid || vid.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(vid, 0, 0, 64, 48);
      const data = ctx.getImageData(0, 0, 64, 48).data;

      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      const brightness = total / (64 * 48);

      if (lastBrightness.current !== null) {
        const change = Math.abs(brightness - lastBrightness.current) / lastBrightness.current;
        if (change > 0.4) {
          addFlag("brightness", `Brightness shift detected (${Math.round(change * 100)}%)`, "medium");
        }
      }
      lastBrightness.current = brightness;
    }, 2000);
  }, [addFlag]);

  useEffect(() => {
    return () => {
      if (brightnessInterval.current) clearInterval(brightnessInterval.current);
    };
  }, []);

  return { flags, startBrightnessMonitoring };
}
