import { useEffect, useRef } from "react";

/** Keyboard containment for the single modal; restores the control that opened it. */
export function useDialogFocus() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const element = ref.current;
    if (!element) return;
    const focusable = () =>
      Array.from(
        element.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex="0"]',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));
    focusable()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = focusable(),
        first = nodes[0],
        last = nodes.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Node && !element.contains(event.target))
        focusable()[0]?.focus();
    };
    element.addEventListener("keydown", key);
    document.addEventListener("focusin", focus);
    return () => {
      element.removeEventListener("keydown", key);
      document.removeEventListener("focusin", focus);
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  return ref;
}
