import type { ReactNode } from "react";

export function ShinyText({ children }: { children: ReactNode }) {
  return <span className="bg-[linear-gradient(110deg,#0f172a,45%,#00d4ff,50%,#8b5cf6,55%,#0f172a)] bg-[length:200%_100%] bg-clip-text text-transparent [animation:shine_5s_linear_infinite]">{children}</span>;
}
