import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

interface TimerContextValue {
  timeRemaining: number;
  initialDuration: number;
  isPaused: boolean;
  isActive: boolean;
  startTimer: (durationSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const clearRunningInterval = () => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopTimer = () => {
    clearRunningInterval();
    setTimeRemaining(0);
    setInitialDuration(0);
    setIsPaused(false);
    localStorage.removeItem('gameTimerTimeRemaining');
    localStorage.removeItem('gameTimerInitialDuration');
    localStorage.removeItem('gameTimerPaused');
  };

  const startTimer = (durationSeconds: number) => {
    clearRunningInterval();
    setInitialDuration(durationSeconds);
    setTimeRemaining(durationSeconds);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (timeRemaining > 0) {
      setIsPaused(false);
    }
  };

  useEffect(() => {
    const savedRemaining = localStorage.getItem('gameTimerTimeRemaining');
    const savedInitial = localStorage.getItem('gameTimerInitialDuration');
    const savedPaused = localStorage.getItem('gameTimerPaused');

    if (savedRemaining && savedInitial) {
      const remaining = Number(savedRemaining);
      const initial = Number(savedInitial);

      if (!Number.isNaN(remaining) && !Number.isNaN(initial) && remaining > 0 && initial > 0) {
        setTimeRemaining(remaining);
        setInitialDuration(initial);
        setIsPaused(savedPaused === 'true');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gameTimerTimeRemaining', String(timeRemaining));
    localStorage.setItem('gameTimerInitialDuration', String(initialDuration));
    localStorage.setItem('gameTimerPaused', String(isPaused));
  }, [timeRemaining, initialDuration, isPaused]);

  useEffect(() => {
    clearRunningInterval();

    if (timeRemaining > 0 && !isPaused) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current !== null) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearRunningInterval();
    };
  }, [timeRemaining, isPaused]);

  const value = useMemo<TimerContextValue>(
    () => ({
      timeRemaining,
      initialDuration,
      isPaused,
      startTimer,
      pauseTimer,
      resumeTimer,
      stopTimer,
      isActive: timeRemaining > 0,
    }),
    [timeRemaining, initialDuration, isPaused]
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);

  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }

  return context;
}
