import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { YatraWheelsLogoMark } from "@/components/YatraWheelsLogo";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const steps = [
      { target: 40, delay: 0, duration: 400 },
      { target: 70, delay: 420, duration: 350 },
      { target: 88, delay: 790, duration: 250 },
      { target: 100, delay: 1060, duration: 300 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(({ target, delay, duration }) => {
      timers.push(
        setTimeout(() => {
          const start = Date.now();
          const from = target === 40 ? 0 : target === 70 ? 40 : target === 88 ? 70 : 88;
          const animate = () => {
            const elapsed = Date.now() - start;
            const fraction = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - fraction, 3);
            setProgress(from + (target - from) * eased);
            if (fraction < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }, delay)
      );
    });

    timers.push(
      setTimeout(() => {
        setExit(true);
        setTimeout(onDone, 500);
      }, 1550)
    );

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  return (
    <AnimatePresence>
      {!exit ? (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ backgroundColor: "#0a0b14" }}
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(91,103,245,0.12) 0%, transparent 70%)"
          }} />

          {/* Logo + Name */}
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-5 relative"
          >
            {/* Logo mark with glow ring */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ background: "radial-gradient(circle, #5b67f5 0%, transparent 70%)" }} />
              <div className="relative rounded-full shadow-2xl shadow-primary/30 overflow-hidden">
                <YatraWheelsLogoMark size={72} />
              </div>
            </div>

            {/* App name */}
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight leading-none">
                Yatra<span className="gradient-text">Wheels</span>
              </h1>
              <p className="mt-2.5 text-sm text-muted-foreground/80 tracking-wide">
                Your journey, our wheels — across India
              </p>
            </div>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="absolute bottom-16 w-48"
          >
            <div className="h-0.5 w-full rounded-full bg-border/40 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #5b67f5, #a78bfa)",
                  transition: "width 0.08s linear",
                  boxShadow: "0 0 8px rgba(91,103,245,0.6)",
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
