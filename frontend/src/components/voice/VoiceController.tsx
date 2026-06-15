"use client";

import { Mic } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function VoiceController() {
  const isRecording = useAppStore((state) => state.isRecording);
  const toggleRecording = useAppStore((state) => state.toggleRecording);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
      <div className="pointer-events-auto rounded-full border border-neutral-700 bg-neutral-950/90 p-2 shadow-[0_0_40px_rgba(16,185,129,0.15)] backdrop-blur">
        <button
          type="button"
          aria-label={isRecording ? "停止录音" : "开始录音"}
          aria-pressed={isRecording}
          onClick={toggleRecording}
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 transition-colors ${
            isRecording
              ? "animate-pulse border-red-500 bg-red-500/20 text-red-400"
              : "border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          }`}
        >
          <Mic className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
