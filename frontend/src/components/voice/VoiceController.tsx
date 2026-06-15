"use client";

import { Mic } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function VoiceController() {
  const isRecording = useAppStore((state) => state.isRecording);
  const toggleRecording = useAppStore((state) => state.toggleRecording);

  return (
    <button
      type="button"
      aria-label={isRecording ? "停止录音" : "开始录音"}
      aria-pressed={isRecording}
      onClick={toggleRecording}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
        isRecording
          ? "animate-pulse border-red-500 bg-red-500/20 text-red-400"
          : "border-emerald-500 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
      }`}
    >
      <Mic className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}
