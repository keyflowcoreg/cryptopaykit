'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

interface LogoItem {
  logoSrc: string;
  name: string;
}

type TrustBarItem = StatItem | LogoItem;

interface TrustBarProps {
  items: TrustBarItem[];
  heading?: string;
}

function isLogoItem(item: TrustBarItem): item is LogoItem {
  return 'logoSrc' in item;
}

function isStatItem(item: TrustBarItem): item is StatItem {
  return 'value' in item;
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (step >= steps) {
        clearInterval(timer);
        setDisplay(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="text-4xl font-bold text-white tabular-nums">
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}

function ScrollingLogos({ logos }: { logos: LogoItem[] }) {
  // Duplicate for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden w-full">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-12 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: logos.length * 3,
            ease: 'linear',
          },
        }}
      >
        {doubled.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex items-center justify-center h-12 px-6 opacity-50 hover:opacity-100 transition-opacity shrink-0"
          >
            <img
              src={logo.logoSrc}
              alt={logo.name}
              className="h-8 max-w-[140px] object-contain brightness-0 invert"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function TrustBar({ items, heading }: TrustBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  const stats = items.filter(isStatItem);
  const logos = items.filter(isLogoItem);

  return (
    <section ref={ref} className="w-full py-12">
      {heading && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-zinc-400 text-center text-sm uppercase tracking-widest mb-8"
        >
          {heading}
        </motion.p>
      )}

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-12 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="flex flex-col items-center gap-1"
            >
              <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              <span className="text-zinc-400 text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Scrolling logos */}
      {logos.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <ScrollingLogos logos={logos} />
        </motion.div>
      )}
    </section>
  );
}
