"use client";

import { useEffect, useRef } from "react";
import type { Canvas, FabricObject } from "fabric";
import { type CanvasAction, useAppStore } from "@/store/useAppStore";

async function createSvgObjectFromAction(
  action: CanvasAction,
  centerX: number,
  centerY: number,
  canvasWidth: number,
  canvasHeight: number,
): Promise<FabricObject | null> {
  if (action.action !== "add_svg" || !action.code.trim()) return null;

  const { loadSVGFromString, util } = await import("fabric");
  const { objects, options } = await loadSVGFromString(action.code);

  const validObjects = objects.filter(
    (object): object is FabricObject => object !== null,
  );

  if (validObjects.length === 0) return null;

  const svgObject = util.groupSVGElements(validObjects, options);
  svgObject.set({
    left: centerX,
    top: centerY,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
  });

  const scaledWidth = svgObject.getScaledWidth();
  const scaledHeight = svgObject.getScaledHeight();

  if (scaledWidth > 0 && scaledHeight > 0) {
    const scale = Math.min(
      (canvasWidth * 0.7) / scaledWidth,
      (canvasHeight * 0.7) / scaledHeight,
      1,
    );
    svgObject.scale(scale);
  }

  return svgObject;
}

export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  const canvasAction = useAppStore((state) => state.canvasAction);
  const canvasActionSeq = useAppStore((state) => state.canvasActionSeq);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const addCanvasObject = useAppStore((state) => state.addCanvasObject);

  useEffect(() => {
    const container = containerRef.current;
    const canvasEl = canvasRef.current;
    if (!container || !canvasEl) return;

    let observer: ResizeObserver | null = null;
    let disposed = false;

    const initCanvas = async () => {
      const { Canvas } = await import("fabric");
      if (disposed || !container || !canvasEl) return;

      const fabricCanvas = new Canvas(canvasEl, {
        enableRetinaScaling: true,
        selection: false,
      });
      fabricCanvasRef.current = fabricCanvas;

      const syncSize = () => {
        const { width, height } = container.getBoundingClientRect();
        if (width === 0 || height === 0) return;

        fabricCanvas.setDimensions({ width, height });
        fabricCanvas.requestRenderAll();
      };

      syncSize();
      observer = new ResizeObserver(syncSize);
      observer.observe(container);
    };

    void initCanvas();

    return () => {
      disposed = true;
      observer?.disconnect();

      const fabricCanvas = fabricCanvasRef.current;
      fabricCanvasRef.current = null;

      if (fabricCanvas) {
        void fabricCanvas.dispose();
      }
    };
  }, []);

  useEffect(() => {
    const fabricCanvas = fabricCanvasRef.current;
    if (!fabricCanvas || !canvasAction || canvasActionSeq === 0) return;

    const applyAction = async () => {
      const centerX = fabricCanvas.getWidth() / 2;
      const centerY = fabricCanvas.getHeight() / 2;
      const svgObject = await createSvgObjectFromAction(
        canvasAction,
        centerX,
        centerY,
        fabricCanvas.getWidth(),
        fabricCanvas.getHeight(),
      );

      if (!svgObject) return;

      fabricCanvas.add(svgObject);
      fabricCanvas.requestRenderAll();

      addCanvasObject({
        type: "svg",
        x: centerX,
        y: centerY,
        width: svgObject.getScaledWidth(),
        height: svgObject.getScaledHeight(),
        props: {
          action: canvasAction.action,
          codeLength: canvasAction.code.length,
        },
      });
    };

    void applyAction();
  }, [canvasActionSeq, canvasAction, addCanvasObject]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} />
      {isGenerating && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="rounded-full border border-emerald-500/30 bg-black/70 px-6 py-3 font-mono text-sm text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.25)] backdrop-blur-md animate-pulse">
            🧠 Agent 正在生成矢量代码...
          </div>
        </div>
      )}
    </div>
  );
}
