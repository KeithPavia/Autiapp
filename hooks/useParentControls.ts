import { useEffect, useState } from 'react';
import {
  DEFAULT_PARENT_CONTROLS,
  ParentControls,
  subscribeToParentControls,
} from '../lib/parentSync';

export function useParentControls(childId?: string) {
  const [controls, setControls] = useState<ParentControls>(DEFAULT_PARENT_CONTROLS);
  const [loading, setLoading] = useState(Boolean(childId));

  useEffect(() => {
    if (!childId) {
      setControls(DEFAULT_PARENT_CONTROLS);
      setLoading(false);
      return;
    }

    const unsub = subscribeToParentControls(childId, (next) => {
      setControls(next);
      setLoading(false);
    });
    return () => unsub();
  }, [childId]);

  return { controls, loading };
}
