import { useEffect, useState } from "react";

import { useDesk } from "@/lib/store";

export function useHydrated() {
  const [hydrated, setHydrated] = useState(() => useDesk.persist.hasHydrated());
  useEffect(() => {
    if (useDesk.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useDesk.persist.onFinishHydration(() => setHydrated(true));
  }, []);
  return hydrated;
}
