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

export interface CanvasAction {
  action: "add_svg";
  code: string;
}

const API_BASE_URL = "http://localhost:8000";

interface AppState {
  isRecording: boolean;
  isGenerating: boolean;
  canvasObjects: CanvasObject[];
  agentLogs: AgentLog[];
  canvasAction: CanvasAction | null;
  canvasActionSeq: number;
  setIsRecording: (isRecording: boolean) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCanvasObjects: (canvasObjects: CanvasObject[]) => void;
  setAgentLogs: (agentLogs: AgentLog[]) => void;
  addAgentLog: (role: AgentLog["role"], message: string) => void;
  addCanvasObject: (object: Omit<CanvasObject, "id">) => void;
  applyCanvasAction: (action: CanvasAction) => void;
  submitCommand: (text: string) => Promise<void>;
  toggleRecording: () => void;
}

const appendLog = (
  logs: AgentLog[],
  role: AgentLog["role"],
  message: string,
): AgentLog[] => [
  ...logs,
  {
    id: crypto.randomUUID(),
    role,
    message,
    createdAt: Date.now(),
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  isRecording: false,
  isGenerating: false,
  canvasObjects: [],
  agentLogs: [],
  canvasAction: null,
  canvasActionSeq: 0,
  setIsRecording: (isRecording) => set({ isRecording }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setCanvasObjects: (canvasObjects) => set({ canvasObjects }),
  setAgentLogs: (agentLogs) => set({ agentLogs }),
  addAgentLog: (role, message) =>
    set((state) => ({
      agentLogs: appendLog(state.agentLogs, role, message),
    })),
  addCanvasObject: (object) =>
    set((state) => ({
      canvasObjects: [
        ...state.canvasObjects,
        { ...object, id: crypto.randomUUID() },
      ],
    })),
  applyCanvasAction: (action) =>
    set((state) => ({
      canvasAction: action,
      canvasActionSeq: state.canvasActionSeq + 1,
    })),
  submitCommand: async (text) => {
    const trimmed = text.trim();
    if (!trimmed || get().isGenerating) return;

    set((state) => ({
      isGenerating: true,
      agentLogs: appendLog(
        state.agentLogs,
        "user",
        `[用户] 文本输入: ${trimmed}`,
      ),
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/command`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(errorBody || `HTTP ${response.status}`);
      }

      const data = (await response.json()) as CanvasAction;

      set((state) => ({
        agentLogs: appendLog(
          state.agentLogs,
          "agent",
          `[Agent] 收到 SVG 指令 (${data.code.length} 字符)`,
        ),
        canvasAction: data,
        canvasActionSeq: state.canvasActionSeq + 1,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "未知错误";

      set((state) => ({
        agentLogs: appendLog(
          state.agentLogs,
          "system",
          `[系统] 请求失败: ${message}`,
        ),
      }));
    } finally {
      set({ isGenerating: false });
    }
  },
  toggleRecording: () =>
    set((state) => {
      const isRecording = !state.isRecording;

      return {
        isRecording,
        agentLogs: appendLog(
          state.agentLogs,
          "system",
          isRecording ? "[系统] 录音已开启..." : "[系统] 录音已结束...",
        ),
      };
    }),
}));
