import { useMemo } from "react";
import { isAndroid, isIOS } from "../deviceType";

export const useCanShareNative = (): boolean => {
  return useMemo(() => {
    if (typeof window === 'undefined') return false
    if (!isAndroid() && !isIOS()) return false
    return typeof navigator?.share == 'function'
  }, [])
}
