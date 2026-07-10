"use client";

import { useEffect, useRef } from "react";

export function PixelTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: PointerEvent) => {
      const pixel = document.createElement("span");
      const x = event.clientX - 3;
      const y = event.clientY - 3;
      pixel.className = "pointer-events-none fixed z-50 h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_18px_rgba(0,212,255,0.9)] transition-transform duration-700 ease-out";
      pixel.style.left = `${x}px`;
      pixel.style.top = `${y}px`;
      container.appendChild(pixel);

      requestAnimationFrame(() => {
        pixel.style.transform = "translate3d(0,0,0) scale(0.25)";
        pixel.style.opacity = "0";
      });

      window.setTimeout(() => pixel.remove(), 700);
    };

    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-50" aria-hidden="true" />;
}
