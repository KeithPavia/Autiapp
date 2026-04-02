import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  addDoc,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from './firebase';

export type SoundMode = 'full' | 'middle' | 'silent';

export type ChildLink = {
  childId: string;
  parentId: string;
  displayName: string;
  childCode: string;
};

export type EmotionAlert = {
  childId: string;
  parentId?: string;
  emotion: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  createdAt?: Timestamp;
  seen?: boolean;
};

export type ProgressLog = {
  childId: string;
  parentId?: string;
  category: 'learning' | 'game' | 'routine' | 'emotion' | 'system';
  activity: string;
  score?: number;
  total?: number;
  level?: number;
  details?: string;
  createdAt?: Timestamp;
};

export type ParentControls = {
  childId: string;
  parentId?: string;
  mathMaxLevel: number;
  englishMaxLevel: number;
  spellingMaxLevel: number;
  safetyMaxLevel: number;
  gamesEnabled: boolean;
  booksEnabled: boolean;
  learningEnabled: boolean;
  rewardsEnabled: boolean;
  soundMode: SoundMode;
  locked: boolean;
  lockReason?: string;
  updatedAt?: Timestamp;
};

export const CHILD_LINK_STORAGE_KEY = 'autiappActiveChildLink';

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
  soundMode: 'full',
  locked: false,
  lockReason: 'Ask your parent to unlock AutiApp.',
};

function withMissingChildLock(controls: ParentControls): ParentControls {
  return {
    ...controls,
    locked: true,
    lockReason: 'A parent must link this device to a child profile first.',
  };
}

export function getActiveChildLink(): ChildLink | null {
  try {
    const raw = localStorage.getItem(CHILD_LINK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChildLink;
    if (!parsed?.childId || !parsed?.parentId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setActiveChildLink(link: ChildLink) {
  localStorage.setItem(CHILD_LINK_STORAGE_KEY, JSON.stringify(link));
}

export function clearActiveChildLink() {
  localStorage.removeItem(CHILD_LINK_STORAGE_KEY);
}

export function getActiveChildId() {
  return getActiveChildLink()?.childId ?? 'child-1';
}

export function normalizeChildId(childId?: string) {
  if (!childId || childId === 'child-1') {
    return getActiveChildId();
  }
  return childId;
}

export async function linkChildByCode(childCodeInput: string) {
  const childCode = childCodeInput.trim().toUpperCase();
  if (!childCode) {
    throw new Error('Please enter a child code.');
  }

  const snap = await getDocs(
    query(collection(db, 'children'), where('childCode', '==', childCode), limit(1)),
  );

  if (snap.empty) {
    throw new Error('That child code was not found.');
  }

  const row = snap.docs[0];
  const data = row.data() as {
    parentId?: string;
    displayName?: string;
    childCode?: string;
  };

  if (!data.parentId) {
    throw new Error('This child profile is missing a parent link.');
  }

  const link: ChildLink = {
    childId: row.id,
    parentId: data.parentId,
    displayName: data.displayName || 'Child',
    childCode: data.childCode || childCode,
  };

  setActiveChildLink(link);

  await setDoc(
    doc(db, 'controls', row.id),
    {
      ...DEFAULT_PARENT_CONTROLS,
      childId: row.id,
      parentId: data.parentId,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return link;
}

export async function ensureChildProfile(
  childId: string,
  displayName: string,
  parentId?: string,
) {
  const resolvedChildId = normalizeChildId(childId);

  await setDoc(
    doc(db, 'children', resolvedChildId),
    {
      childId: resolvedChildId,
      parentId: parentId ?? getActiveChildLink()?.parentId ?? null,
      displayName,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    doc(db, 'controls', resolvedChildId),
    {
      ...DEFAULT_PARENT_CONTROLS,
      childId: resolvedChildId,
      parentId: parentId ?? getActiveChildLink()?.parentId ?? null,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function logProgress(input: Omit<ProgressLog, 'createdAt'>) {
  const link = getActiveChildLink();
  const childId = normalizeChildId(input.childId);

  await addDoc(collection(db, 'progress'), {
    ...input,
    childId,
    parentId: input.parentId ?? link?.parentId ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function sendEmotionAlert(input: Omit<EmotionAlert, 'createdAt' | 'seen'>) {
  const link = getActiveChildLink();
  const childId = normalizeChildId(input.childId);

  await addDoc(collection(db, 'alerts'), {
    ...input,
    childId,
    parentId: input.parentId ?? link?.parentId ?? null,
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
  const resolvedChildId = normalizeChildId(childId);

  await logProgress({
    childId: resolvedChildId,
    category: 'emotion',
    activity: 'emotion-check',
    details: `${emotion}: ${reason}`,
  });

  if (severity !== 'low') {
    await sendEmotionAlert({
      childId: resolvedChildId,
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
  const activeLink = getActiveChildLink();
  const resolvedChildId = normalizeChildId(childId);

  if (!activeLink && (!childId || childId === 'child-1')) {
    onChange(withMissingChildLock(DEFAULT_PARENT_CONTROLS));
    return () => {};
  }

  return onSnapshot(doc(db, 'controls', resolvedChildId), (snap) => {
    const data = snap.data();
    if (!data) {
      onChange({
        ...DEFAULT_PARENT_CONTROLS,
        childId: resolvedChildId,
        parentId: activeLink?.parentId,
      });
      return;
    }

    onChange({
      ...DEFAULT_PARENT_CONTROLS,
      ...data,
      childId: resolvedChildId,
      parentId: (data as any).parentId ?? activeLink?.parentId,
    } as ParentControls);
  });
}

export function subscribeToLatestAlerts(
  childId: string,
  onChange: (alerts: EmotionAlert[]) => void,
) {
  const resolvedChildId = normalizeChildId(childId);
  const q = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const rows = snap.docs
      .map((d) => d.data() as EmotionAlert)
      .filter((row) => row.childId === resolvedChildId)
      .slice(0, 20);
    onChange(rows);
  });
}
