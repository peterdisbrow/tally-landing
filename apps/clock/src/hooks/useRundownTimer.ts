import { useEffect, useState } from "react";
import { subscribeRundownTimer, type RundownTimerFeed } from "@/lib/rundownTimer";

const IDLE: RundownTimerFeed = { status: "idle", snapshot: null, receivedAt: null, ended: false };

/**
 * Live Rundown timer feed for a share token. Pass `enabled=false` (signed out,
 * wrong mode, no link) and no socket is opened.
 */
export function useRundownTimer(token: string | null | undefined, enabled: boolean): RundownTimerFeed {
  const [feed, setFeed] = useState<RundownTimerFeed>(IDLE);

  useEffect(() => {
    if (!enabled || !token) {
      setFeed(IDLE);
      return;
    }
    return subscribeRundownTimer(token, setFeed);
  }, [token, enabled]);

  return enabled && token ? feed : IDLE;
}
