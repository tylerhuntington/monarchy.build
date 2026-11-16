"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
export function CopyButton({
  text,
  label = "Copy code",
}: {
  text: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
    }
  }
  return (
    <button
      className="copy-button"
      onClick={copy}
      aria-label={state === "copied" ? "Copied" : label}
      title={label}
    >
      {state === "copied" ? <Check size={15} /> : <Copy size={15} />}
      <span className="sr-only" role="status">
        {state === "copied"
          ? "Copied to clipboard"
          : state === "error"
            ? "Copy unavailable. Select the code to copy it."
            : ""}
      </span>
    </button>
  );
}
