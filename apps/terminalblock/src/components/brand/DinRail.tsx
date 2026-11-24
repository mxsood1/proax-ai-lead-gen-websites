import { cn } from "@/lib/cn";
import { EndStop, TerminalModule, type ModuleConnection, type ModuleVariant } from "./TerminalModule";

export type RailModule = { variant: ModuleVariant; label?: string; connection?: ModuleConnection };

type Props = {
  modules: RailModule[];
  scale?: number;
  animate?: boolean;
  className?: string;
};

/** A DIN-rail assembly: rail + end stops + a row of terminal modules that snap in. */
export function DinRail({ modules, scale, animate = true, className }: Props) {
  return (
    <div className={cn("relative inline-flex items-center", className)} style={{ fontSize: scale }}>
      {/* the rail */}
      <div className="din-rail absolute inset-x-[-1.5em] top-1/2 h-[2.3em] -translate-y-1/2 rounded-[0.12em] shadow-[0_0.3em_0.8em_-0.3em_rgba(0,0,0,.7)]" />
      <div className="relative flex items-center gap-[0.04em]">
        <EndStop scale={scale} />
        {modules.map((m, i) => (
          <div
            key={i}
            className={animate ? "animate-snap-in" : undefined}
            style={animate ? { animationDelay: `${200 + i * 85}ms` } : undefined}
          >
            <TerminalModule variant={m.variant} label={m.label} connection={m.connection} scale={scale} />
          </div>
        ))}
        <EndStop scale={scale} />
      </div>
    </div>
  );
}
