import { useEffect, useState } from 'react';
import { api } from '../api/endpoints';
import type { FormOptions } from '../types/api';

let cache: FormOptions | undefined; // dropdown lists rarely change; fetch once per page load

/** Loads dropdown values (colleges, courses...) from GET /meta/options. */
export function useOptions() {
  const [options, setOptions] = useState<FormOptions | undefined>(cache);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (cache) return;
    api.getOptions().then((o) => { cache = o; setOptions(o); }).catch((e: Error) => setError(e.message));
  }, []);

  return { options, error, loading: !options && !error };
}
export const resetOptionsCache = () => { cache = undefined; };
