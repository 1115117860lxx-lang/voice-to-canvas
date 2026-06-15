"use client";

import dynamic from "next/dynamic";
import VoiceController from "@/components/voice/VoiceController";
import { useAppStore } from "@/store/useAppStore";

const FabricCanvas = dynamic(
  () => import("@/components/canvas/FabricCanvas"),
  { ssr: false },
);

export default function HomePage() {
  const agentLogs = useAppStore((state) => state.agentLogs);
  const canvasObjects = useAppStore((state) => state.canvasObjects);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-100">
      <div className="flex h-full min-h-0">
        <aside className="flex w-[300px] shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
          <header className="border-b border-neutral-800 px-4 py-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
              Console
            </p>
            <h1 className="mt-1 text-sm font-semibold text-neutral-100">
              Agent Logs
            </h1>
          </header>
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-neutral-400">
            {agentLogs.length === 0 ? (
              <p className="leading-6 text-neutral-500">
                // 等待 AI 思考日志...
                <br />
                // 语音指令将在此实时输出
              </p>
            ) : (
              <ul className="space-y-2">
                {agentLogs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded border border-neutral-800 bg-neutral-900/50 px-3 py-2 leading-5"
                  >
                    <span
                      className={
                        log.role === "system"
                          ? "text-emerald-400"
                          : log.role === "agent"
                            ? "text-cyan-400"
                            : "text-amber-400"
                      }
                    >
                      {log.message}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <section className="relative flex min-h-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">
                Canvas Area
              </p>
              <h2 className="text-sm font-semibold">voice-to-canvas</h2>
            </div>
            <span className="rounded-full border border-neutral-700 px-3 py-1 font-mono text-xs text-neutral-400">
              objects: {canvasObjects.length}
            </span>
          </header>

          <div className="relative min-h-0 flex-1 bg-neutral-950">
            <FabricCanvas />
          </div>
        </section>
      </div>

      <VoiceController />
    </main>
  );
}
