import { useState, useEffect } from 'react';

export interface SlaCountdownResult {
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
  isBreached: boolean;
  isWarning: boolean; // within 6 hours
  totalRemainingSeconds: number;
}

export function useSlaCountdown(deadlineDate: string | Date | null | undefined): SlaCountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!deadlineDate) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineDate]);

  if (!deadlineDate) {
    return {
      formatted: '--:--:--',
      hours: 0,
      minutes: 0,
      seconds: 0,
      isBreached: false,
      isWarning: false,
      totalRemainingSeconds: 0
    };
  }

  const target = new Date(deadlineDate).getTime();
  const diffMs = target - now;
  const isBreached = diffMs <= 0;
  const absDiff = Math.abs(diffMs);

  const totalSeconds = Math.floor(absDiff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  const isWarning = !isBreached && hours < 6;

  return {
    formatted: isBreached ? `BREACHED by ${formatted}` : formatted,
    hours,
    minutes,
    seconds,
    isBreached,
    isWarning,
    totalRemainingSeconds: isBreached ? 0 : totalSeconds
  };
}
