"use client";

import { useEffect, useState } from "react";

export function TextType({ lines, speed = 48 }: { lines: string[]; speed?: number }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex % lines.length];
    const timeout = window.setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length) {
          window.setTimeout(() => setDeleting(true), 1200);
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 1) {
          setDeleting(false);
          setLineIndex((value) => (value + 1) % lines.length);
        }
      }
    }, deleting ? speed / 1.5 : speed);

    return () => window.clearTimeout(timeout);
  }, [deleting, lineIndex, lines, speed, text]);

  return <span className="inline-block min-h-[1.4em] text-cyan-500">{text}<span className="animate-pulse">|</span></span>;
}
