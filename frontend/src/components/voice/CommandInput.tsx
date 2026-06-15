"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function CommandInput() {
  const submitCommand = useAppStore((state) => state.submitCommand);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const [text, setText] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || isGenerating) return;

    const currentText = text;
    await submitCommand(currentText);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="输入绘图指令，例如：画一个机器人"
        disabled={isGenerating}
        className="h-11 w-72 rounded-full border border-neutral-700 bg-neutral-900/80 px-4 font-mono text-sm text-neutral-100 placeholder:text-neutral-500 outline-none transition-colors focus:border-emerald-500/60 disabled:cursor-not-allowed disabled:opacity-50 sm:w-80"
      />
      <button
        type="submit"
        disabled={isGenerating || !text.trim()}
        aria-label={isGenerating ? "正在生成" : "发送指令"}
        className="flex h-11 items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 font-mono text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="h-4 w-4" strokeWidth={2} />
        )}
        发送
      </button>
    </form>
  );
}
