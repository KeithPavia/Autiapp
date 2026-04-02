import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  addDoc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

export type EmotionAlert = {
  childId: string;
  emotion: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  createdAt?: Timestamp;
  seen?: boolean;
};

export type ProgressLog = {
  childId: string;
  category: 'learning' | 'game' | 'routine' | 'emotion';
  activity: string;
  score?: number;
  total?: number;
  level?: number;
  details?: string;
  createdAt?: Timestamp;
};

export type ParentControls = {
  childId: string;
  mathMaxLevel: number;
  englishMaxLevel: number;
  spellingMaxLevel: number;
  safetyMaxLevel: number;
  gamesEnabled: boolean;
  booksEnabled: boolean;
  learningEnabled: boolean;
  rewardsEnabled: boolean;
  updatedAt?: Timestamp;
};

export const DEFAULT_PARENT_CONTROLS: ParentControls = {
  childId: 'child-1',
  mathMaxLevel: 1,
  englishMaxLevel: 1,
  spellingMaxLevel: 1,
  safetyMaxLevel: 1,
  gamesEnabled: true,
  booksEnabled: true,
  learningEnabled: true,
  rewardsEnabled: true,
};

export async function ensureChildProfile(childId: string, displayName: string) {
  await setDoc(
    doc(db, 'children', childId),
    { childId, displayName, updatedAt: serverTimestamp() },
    { merge: true },
  );

  await setDoc(
    doc(db, 'controls', childId),
    { ...DEFAULT_PARENT_CONTROLS, childId, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function logProgress(input: Omit<ProgressLog, 'createdAt'>) {
  await addDoc(collection(db, 'progress'), {
    ...input,
    createdAt: serverTimestamp(),
  });
}

export async function sendEmotionAlert(input: Omit<EmotionAlert, 'createdAt' | 'seen'>) {
  await addDoc(collection(db, 'alerts'), {
    ...input,
    seen: false,
    createdAt: serverTimestamp(),
  });
}

export async function saveEmotionCheck(
  childId: string,
  emotion: string,
  reason: string,
  severity: 'low' | 'medium' | 'high',
) {
  await logProgress({
    childId,
    category: 'emotion',
    activity: 'emotion-check',
    details: `${emotion}: ${reason}`,
  });

  if (severity !== 'low') {
    await sendEmotionAlert({
      childId,
      emotion,
      reason,
      severity,
    });
  }
}

export function subscribeToParentControls(
  childId: string,
  onChange: (controls: ParentControls) => void,
) {
  return onSnapshot(doc(db, 'controls', childId), (snap) => {
    const data = snap.data();
    if (!data) {
      onChange(DEFAULT_PARENT_CONTROLS);
      return;
    }

    onChange({
      ...DEFAULT_PARENT_CONTROLS,
      ...data,
      childId,
    } as ParentControls);
  });
}

export function subscribeToLatestAlerts(
  childId: string,
  onChange: (alerts: EmotionAlert[]) => void,
) {
  const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map((d) => d.data() as EmotionAlert)
      .filter((row) => row.childId === childId);
    onChange(rows);
  });
}



export async function testFirebase() {
  await addDoc(collection(db, "test"), {
    message: "Hello from child app",
    time: new Date(),
  });

  console.log("🔥 Firebase test sent");
}
