'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  targetDate: string | Date;
  label?: string;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const total = target.getTime() - Date.now();
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
    total,
  };
}

function FlipDigit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  const display = String(value).padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={display}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={`flex items-center justify-center w-16 h-20 sm:w-20 sm:h-24 rounded-xl text-3xl sm:text-4xl font-bold tabular-nums select-none border ${
              urgent
                ? 'bg-red-950/60 border-red-800/50 text-red-300'
                : 'bg-zinc-800 border-zinc-700 text-white'
            }`}
            style={{ perspective: 600 }}
          >
            {display}
          </motion.div>
        </AnimatePresence>
        {/* Top/bottom divider line */}
        <div
          className={`absolute left-0 right-0 top-1/2 h-px ${
            urgent ? 'bg-red-900/50' : 'bg-zinc-700/50'
          }`}
        />
      </div>
      <span className={`text-xs uppercase tracking-wider font-medium ${urgent ? 'text-red-400' : 'text-zinc-500'}`}>
        {label}
      </span>
    </div>
  );
}

function Separator({ urgent }: { urgent: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 pb-6">
      <motion.span
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className={`text-2xl sm:text-3xl font-bold ${urgent ? 'text-red-500' : 'text-zinc-600'}`}
      >
        :
      </motion.span>
    </div>
  );
}

export function CountdownTimer({ targetDate, label, onComplete }: CountdownTimerProps) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(target));
  const [expired, setExpired] = useState(false);
  const onCompleteRef = useCallback(() => onComplete?.(), [onComplete]);

  useEffect(() => {
    const timer = setInterval(() => {
      const tl = calculateTimeLeft(target);
      setTimeLeft(tl);
      if (tl.total <= 0) {
        clearInterval(timer);
        setExpired(true);
        onCompleteRef();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [target, onCompleteRef]);

  // Urgent when less than 1 hour
  const urgent = !expired && timeLeft.total > 0 && timeLeft.total < 3600 * 1000;

  if (expired) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3 py-8"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-zinc-500">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-zinc-400 text-lg font-medium">Offer expired</p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {label && (
        <p className={`text-sm font-medium uppercase tracking-wider ${urgent ? 'text-red-400' : 'text-zinc-400'}`}>
          {label}
        </p>
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        <FlipDigit value={timeLeft.days} label="Days" urgent={urgent} />
        <Separator urgent={urgent} />
        <FlipDigit value={timeLeft.hours} label="Hours" urgent={urgent} />
        <Separator urgent={urgent} />
        <FlipDigit value={timeLeft.minutes} label="Minutes" urgent={urgent} />
        <Separator urgent={urgent} />
        <FlipDigit value={timeLeft.seconds} label="Seconds" urgent={urgent} />
      </div>

      {urgent && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm font-medium flex items-center gap-1.5"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          Hurry! Ending soon
        </motion.p>
      )}
    </div>
  );
}
