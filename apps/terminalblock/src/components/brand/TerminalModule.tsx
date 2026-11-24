import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export type ModuleVariant = "grey" | "blue" | "ground" | "orange" | "dark" | "fuse";
export type ModuleConnection = "push-in" | "spring" | "screw";

const bodies: Record<ModuleVariant, string> = {
  grey: "linear-gradient(90deg,#8e949c 0%,#c9cdd2 22%,#bfc4ca 60%,#9aa0a8 88%,#7d838b 100%)",
  blue: "linear-gradient(90deg,#1f4f9e 0%,#3b7be0 22%,#3270d4 60%,#2559b0 88%,#1b468c 100%)",
  ground: "linear-gradient(90deg,#1f7a36 0%,#34b356 22%,#2ea24c 60%,#24843d 88%,#1b6a30 100%)",
  orange: "linear-gradient(90deg,#c43f0c 0%,#ff6a2e 22%,#ff5a1f 60%,#d94a12 88%,#b23a0b 100%)",
  dark: "linear-gradient(90deg,#1c1f24 0%,#3a3f48 22%,#30353d 60%,#22262c 88%,#15171b 100%)",
  fuse: "linear-gradient(90deg,#6f757d 0%,#a9aeb5 22%,#9ea3aa 60%,#7f858d 88%,#646a72 100%)",
};

type Props = {
  variant?: ModuleVariant;
  connection?: ModuleConnection;
  label?: string;
  /** font-size in px — every inner dimension is in em, so this scales the module. Omit to inherit. */
  scale?: number;
  className?: string;
  style?: CSSProperties;
};

function Entry({ connection, flip }: { connection: ModuleConnection; flip?: boolean }) {
  return (
    <div
      className={cn("absolute left-1/2 flex -translate-x-1/2 flex-col items-center gap-[0.35em]", flip ? "bottom-[0.9em] flex-col-reverse" : "top-[0.9em]")}
    >
      {/* wire entry */}
      <div className="h-[0.95em] w-[1.15em] rounded-[0.12em] bg-[#0b0c0e] shadow-[inset_0_0.12em_0.2em_rgba(0,0,0,.9),0_0.06em_0_rgba(255,255,255,.35)]" />
      {connection === "push-in" && (
        <div className="h-[0.55em] w-[0.95em] rounded-[0.1em] bg-[linear-gradient(180deg,#ff7a44,#e2470e)] shadow-[0_0.08em_0_rgba(0,0,0,.35)]" />
      )}
      {connection === "spring" && (
        <div className="h-[0.7em] w-[0.42em] rounded-[0.08em] bg-[#0b0c0e] shadow-[inset_0_0.1em_0.15em_rgba(0,0,0,.9)]" />
      )}
      {connection === "screw" && (
        <div className="relative h-[0.95em] w-[0.95em] rounded-full bg-[radial-gradient(circle_at_35%_30%,#f4f5f7,#9097a0_60%,#5d636c)] shadow-[0_0.06em_0.12em_rgba(0,0,0,.5)]">
          <div className="absolute left-1/2 top-1/2 h-[0.14em] w-[0.7em] -translate-x-1/2 -translate-y-1/2 rotate-[-30deg] rounded bg-[#3a3f46]" />
        </div>
      )}
    </div>
  );
}

export function TerminalModule({
  variant = "grey",
  connection = "push-in",
  label,
  scale,
  className,
  style,
}: Props) {
  const markerText = variant === "ground" ? (label ?? "PE") : label;
  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ fontSize: scale, width: "2.7em", height: "9.4em", ...style }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[0.32em] shadow-[0_0.5em_1em_-0.4em_rgba(0,0,0,.55),inset_0_0.08em_0_rgba(255,255,255,.35)]"
        style={{ background: bodies[variant] }}
      >
        {variant === "ground" && <div className="ground-stripes absolute inset-x-0 top-[3.6em] h-[2.2em] opacity-90" />}
        {/* top & bottom ridges */}
        <div className="absolute inset-x-0 top-0 h-[0.45em] bg-black/15" />
        <div className="absolute inset-x-0 bottom-0 h-[0.45em] bg-black/20" />
        {/* side groove */}
        <div className="absolute inset-y-[0.45em] right-[0.28em] w-[0.08em] bg-black/20" />
      </div>
      <Entry connection={connection} />
      <Entry connection={connection} flip />
      {/* marker strip / fuse window */}
      {variant === "fuse" ? (
        <div className="absolute left-1/2 top-1/2 h-[2.4em] w-[1.6em] -translate-x-1/2 -translate-y-1/2 rounded-[0.15em] bg-[#1b1d21] p-[0.18em] shadow-[inset_0_0.1em_0.2em_rgba(0,0,0,.8)]">
          <div className="h-full w-full rounded-[0.1em] bg-[linear-gradient(180deg,#d9dde2,#f5f6f8_45%,#bcc2c9)]">
            <div className="mx-auto h-full w-[0.1em] bg-[#8a6d1f]" />
          </div>
        </div>
      ) : (
        markerText && (
          <div className="absolute left-1/2 top-1/2 flex h-[1.5em] w-[2.05em] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[0.12em] bg-[#fbfbf8] font-mono text-[0.5em] font-medium leading-none text-ink shadow-[0_0.08em_0.12em_rgba(0,0,0,.35)]">
            <span className="text-[1em]">{markerText}</span>
          </div>
        )
      )}
    </div>
  );
}

/** End plate + end stop that cap a rail assembly */
export function EndStop({ scale }: { scale?: number }) {
  return (
    <div className="relative shrink-0" style={{ fontSize: scale, width: "1.6em", height: "7.2em" }} aria-hidden="true">
      <div className="absolute inset-0 rounded-[0.25em] bg-[linear-gradient(90deg,#2b2f36,#4a505a_40%,#2b2f36)] shadow-[0_0.4em_0.8em_-0.3em_rgba(0,0,0,.6)]" />
      <div className="absolute left-1/2 top-[0.7em] h-[0.7em] w-[0.7em] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#e8eaed,#7b828b)]" />
    </div>
  );
}
