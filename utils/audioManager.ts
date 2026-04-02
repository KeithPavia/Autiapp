type ManagedAudio = HTMLAudioElement;

const managedAudio = new Set<ManagedAudio>();
let globalAudioMuted = false;
const subscribers = new Set<(muted: boolean) => void>();

function notifySubscribers() {
  subscribers.forEach((callback) => {
    try {
      callback(globalAudioMuted);
    } catch {
      // ignore subscriber errors
    }
  });
}

export function getGlobalAudioMuted() {
  return globalAudioMuted;
}

export function setGlobalAudioMuted(muted: boolean) {
  globalAudioMuted = muted;

  if (muted) {
    managedAudio.forEach((audio) => {
      try {
        audio.pause();
      } catch {
        // ignore pause errors
      }
    });
  }

  notifySubscribers();
}

export function subscribeGlobalAudioMuted(callback: (muted: boolean) => void) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

export function registerManagedAudio(audio: HTMLAudioElement) {
  managedAudio.add(audio);

  if (globalAudioMuted) {
    try {
      audio.pause();
    } catch {
      // ignore pause errors
    }
  }
}

export function unregisterManagedAudio(audio: HTMLAudioElement | null | undefined) {
  if (!audio) return;
  managedAudio.delete(audio);
}

export function pauseEverything(reset = false) {
  managedAudio.forEach((audio) => {
    try {
      audio.pause();
      if (reset) {
        audio.currentTime = 0;
      }
    } catch {
      // ignore errors
    }
  });
}

export function pauseForBackground() {
  pauseEverything(false);
}

export function resumeAfterBackground() {
  if (globalAudioMuted) return;

  managedAudio.forEach((audio) => {
    try {
      if (audio.paused) {
        audio.play().catch(() => {
          // ignore resume failures
        });
      }
    } catch {
      // ignore errors
    }
  });
}

export function playColoringSound() {
  if (globalAudioMuted) return null;

  const audio = new Audio('/custom-sounds/color-pop.wav');
  registerManagedAudio(audio);

  audio.onended = () => {
    unregisterManagedAudio(audio);
  };

  audio.onerror = () => {
    unregisterManagedAudio(audio);
  };

  audio.play().catch(() => {
    unregisterManagedAudio(audio);
  });

  return audio;
}
