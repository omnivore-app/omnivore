import { ReactNode, useRef } from "react";
import { useOutsideClick } from "../../lib/hooks/useOutsideClick";

type OutsideClickWrapperProps = {
  children: ReactNode
  onOutsideClick: () => void
}

export function OutsideClickWrapper(
    props: OutsideClickWrapperProps
): JSX.Element {
  const wrapperRef = useRef(null);
  useOutsideClick(wrapperRef, props.onOutsideClick);

  return <div ref={wrapperRef}>{props.children}</div>;
}
