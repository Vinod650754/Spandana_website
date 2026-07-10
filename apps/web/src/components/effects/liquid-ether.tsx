"use client";

import { useEffect, useRef } from "react";

export function LiquidEther() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      context.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      for (let index = 0; index < 5; index += 1) {
        const progress = frame * 0.0007 + index * 0.9;
        const x = width * (0.18 + Math.sin(progress) * 0.12 + index * 0.13);
        const y = height * (0.24 + Math.cos(progress * 1.4) * 0.08 + index * 0.11);
        const gradient = context.createRadialGradient(x, y, 10, x, y, 180);
        gradient.addColorStop(0, index % 2 === 0 ? "rgba(0,212,255,0.22)" : "rgba(139,92,246,0.22)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(x, y, 180, 0, Math.PI * 2);
        context.fill();
      }

      frame += 1;
      requestAnimationFrame(draw);
    };

    const animation = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animation);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-70 mix-blend-multiply" aria-hidden="true" />;
}
