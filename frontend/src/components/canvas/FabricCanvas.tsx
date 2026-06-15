"use client";

import { useEffect, useRef } from "react";
import type { Canvas } from "fabric";

export default function FabricCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvasEl = canvasRef.current;
    if (!container || !canvasEl) return;

    let observer: ResizeObserver | null = null;
    let disposed = false;

    const initCanvas = async () => {
      const { Canvas, Rect } = await import("fabric");
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

      const { width, height } = container.getBoundingClientRect();
      const rect = new Rect({
        left: width / 2 - 50,
        top: height / 2 - 50,
        width: 100,
        height: 100,
        fill: "rgba(255, 0, 0, 0.5)",
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(rect);
      fabricCanvas.requestRenderAll();
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

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
