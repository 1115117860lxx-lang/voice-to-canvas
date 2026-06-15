import { create } from "zustand";

export interface CanvasObject {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, unknown>;
}

export interface AgentLog {
  id: string;
  role: "system" | "agent" | "user";
  message: string;
  createdAt: number;
}

interface AppState {
  isRecording: boolean;
  canvasObjects: CanvasObject[];
  agentLogs: AgentLog[];
  setIsRecording: (isRecording: boolean) => void;
  setCanvasObjects: (canvasObjects: CanvasObject[]) => void;
  setAgentLogs: (agentLogs: AgentLog[]) => void;
  toggleRecording: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isRecording: false,
  canvasObjects: [],
  agentLogs: [],
  setIsRecording: (isRecording) => set({ isRecording }),
  setCanvasObjects: (canvasObjects) => set({ canvasObjects }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),
  toggleRecording: () =>
    set((state) => {
      const isRecording = !state.isRecording;

      return {
        isRecording,
        agentLogs: [
          ...state.agentLogs,
          {
            id: crypto.randomUUID(),
            role: "system",
            message: isRecording
              ? "[系统] 录音已开启..."
              : "[系统] 录音已结束...",
            createdAt: Date.now(),
          },
        ],
      };
    }),
}));
