"use client";

import { useEffect, useRef } from "react";

/**
 * One IntersectionObserver for the whole document.
 *
 * Every reveal on the site used to mount its own animation component with its
 * own observer — around 130 of them, and 30+ on a single page like the library
 * catalogue. They all wanted the same answer to the same question, so they now
 * share one observer and the transition itself is plain CSS.
 */
let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (sharedObserver) return sharedObserver;

  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        // Reveals are one-way: once seen, stop paying to watch it.
        sharedObserver?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -50px 0px" }
  );

  return sharedObserver;
}

/**
 * Returns a ref to attach to the element that should reveal. The element is
 * expected to carry `data-reveal` (or `data-stagger`) so the CSS in
 * globals.css knows about it.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = getSharedObserver();
    if (!observer) {
      // No observer support: show the content rather than hiding it forever.
      el.setAttribute("data-revealed", "");
      return;
    }

    // An element already in view when the page settles is caught by the
    // observer's initial callback, so there is no separate check here.
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return ref;
}
