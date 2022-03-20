import { MutableRefObject, useEffect } from "react";

export function useOutsideClick(ref: MutableRefObject<any>, onOutsideClick: () => void) {
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick()
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}
