"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildSrcdoc, type FileMap } from "@/features/sandbox/build-srcdoc";
import type { MockApiDefinition } from "@/features/sandbox/harness";
import {
  VIEWPORT_DIMENSIONS,
  dimensionForWidth,
  filterObjectivesForAutoRun,
  groupObjectivesByViewport,
  viewportWidthOf,
  type PreviewViewport,
} from "@/features/sandbox/viewport";
import {
  isFrameMessage,
  type ConsoleEntry,
  type LoopTimerEvent,
  type Objective,
  type ObjectiveResult,
} from "@/features/validation/types";

export interface SandboxFrameProps {
  files: FileMap;
  objectives: Objective[];
  /** Naikkan nilai ini untuk menjalankan ulang frame. */
  runToken: number;
  /** true (Deploy) = audit semua viewport & seluruh objektif; false (auto) = cepat. */
  fullAudit: boolean;
  viewport: PreviewViewport;
  xrayEnabled: boolean;
  /** Endpoint API tiruan (quest.mocks) — dipasang sebelum kode mahasiswa. */
  mocks?: MockApiDefinition[];
  onConsole?: (entry: ConsoleEntry) => void;
  onRuntimeError?: (message: string) => void;
  onValidationResult?: (results: ObjectiveResult[]) => void;
  onTimeout?: () => void;
  onLoopTimer?: (event: LoopTimerEvent) => void;
  timeoutMs?: number;
}

interface Layout {
  width: number;
  height: number;
}

function nextFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    const step = (remaining: number) => {
      if (remaining <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(remaining - 1));
    };
    step(count);
  });
}

export function SandboxFrame({
  files,
  objectives,
  runToken,
  fullAudit,
  viewport,
  xrayEnabled,
  mocks,
  onConsole,
  onRuntimeError,
  onValidationResult,
  onTimeout,
  onLoopTimer,
  timeoutMs = 3000,
}: SandboxFrameProps) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [validationLayout, setValidationLayout] = useState<Layout | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingRef = useRef<{ nonce: string } | null>(null);
  const resolversRef = useRef(new Map<string, (results: ObjectiveResult[]) => void>());
  const epochRef = useRef(0);
  const globalTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filesRef = useRef(files);
  const objectivesRef = useRef(objectives);
  const fullAuditRef = useRef(fullAudit);
  const viewportRef = useRef(viewport);
  const xrayRef = useRef(xrayEnabled);
  const mocksRef = useRef(mocks);
  const onConsoleRef = useRef(onConsole);
  const onRuntimeErrorRef = useRef(onRuntimeError);
  const onValidationResultRef = useRef(onValidationResult);
  const onTimeoutRef = useRef(onTimeout);
  const onLoopTimerRef = useRef(onLoopTimer);

  useEffect(() => {
    filesRef.current = files;
    objectivesRef.current = objectives;
    fullAuditRef.current = fullAudit;
    viewportRef.current = viewport;
    xrayRef.current = xrayEnabled;
    mocksRef.current = mocks;
    onConsoleRef.current = onConsole;
    onRuntimeErrorRef.current = onRuntimeError;
    onValidationResultRef.current = onValidationResult;
    onTimeoutRef.current = onTimeout;
    onLoopTimerRef.current = onLoopTimer;
  });

  /* Ukur lebar wadah agar preview viewport tetap bisa di-zoom-out (fit). */
  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      setWrapperWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const failRun = useCallback(() => {
    epochRef.current += 1;
    pendingRef.current = null;
    resolversRef.current.clear();
    setValidationLayout(null);
    setSrcDoc(null);
    setRunning(false);
    onTimeoutRef.current?.();
  }, []);

  /* Jalankan ulang sandbox setiap runToken berubah. */
  useEffect(() => {
    if (runToken === 0) return;

    const nonce = crypto.randomUUID();
    epochRef.current += 1;
    const epoch = epochRef.current;

    pendingRef.current = { nonce };
    resolversRef.current.clear();
    setSrcDoc(buildSrcdoc(filesRef.current, nonce, { mocks: mocksRef.current }));
    setRunning(true);

    if (globalTimeoutRef.current) clearTimeout(globalTimeoutRef.current);
    globalTimeoutRef.current = setTimeout(() => {
      if (epochRef.current !== epoch) return;
      failRun();
    }, timeoutMs + 5000);

    return () => {
      if (globalTimeoutRef.current) clearTimeout(globalTimeoutRef.current);
    };
  }, [runToken, timeoutMs, failRun]);

  /* Teruskan status X-Ray ke frame (juga saat dokumen baru dimuat). */
  useEffect(() => {
    if (srcDoc === null) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "xray", enabled: xrayEnabled },
      "*",
    );
  }, [xrayEnabled, srcDoc]);

  useEffect(() => {
    function requestValidation(
      frame: HTMLIFrameElement,
      requestId: string,
      targets: Objective[],
    ): Promise<ObjectiveResult[] | null> {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolversRef.current.delete(requestId);
          resolve(null);
        }, timeoutMs);
        resolversRef.current.set(requestId, (results) => {
          clearTimeout(timer);
          resolve(results);
        });
        frame.contentWindow?.postMessage({ type: "validate", requestId, objectives: targets }, "*");
      });
    }

    async function orchestrate(frame: HTMLIFrameElement, epoch: number): Promise<void> {
      // Mulai dari layout dasar (layout override validasi sebelumnya dibersihkan).
      setValidationLayout(null);
      const allObjectives = objectivesRef.current;

      // Auto-run: lewati objektif ber-waitFor (lambat) & fokus viewport aktif.
      let targets = allObjectives;
      if (!fullAuditRef.current) {
        targets = filterObjectivesForAutoRun(allObjectives);
      }

      let groups = groupObjectivesByViewport(targets);

      if (!fullAuditRef.current) {
        const currentWidth = viewportWidthOf(viewportRef.current);
        groups = groups.filter(
          (group) => group.viewport === null || group.viewport === currentWidth,
        );
      }

      const collected = new Map<string, ObjectiveResult>();

      for (const group of groups) {
        if (epochRef.current !== epoch) return;

        if (group.viewport !== null) {
          const dimension = dimensionForWidth(group.viewport);
          setValidationLayout({ width: dimension.width, height: dimension.height });
          await nextFrames(3);
          if (epochRef.current !== epoch) return;
        }

        const results = await requestValidation(frame, crypto.randomUUID(), group.objectives);
        if (epochRef.current !== epoch) return;
        if (results === null) {
          failRun();
          return;
        }
        for (const result of results) collected.set(result.id, result);
      }

      setValidationLayout(null);
      setRunning(false);
      // Kirim hanya objective yang benar-benar diperiksa (sparse) — sisanya
      // mempertahankan hasil sebelumnya di sisi React.
      const ordered: ObjectiveResult[] = [];
      for (const objective of allObjectives) {
        const result = collected.get(objective.id);
        if (result) ordered.push(result);
      }
      onValidationResultRef.current?.(ordered);
    }

    function handleMessage(event: MessageEvent) {
      const frame = iframeRef.current;
      if (frame && event.source && event.source !== frame.contentWindow) return;

      const data: unknown = event.data;
      if (!isFrameMessage(data)) return;

      const pending = pendingRef.current;
      if (!pending || data.nonce !== pending.nonce) return;

      switch (data.type) {
        case "ready": {
          if (globalTimeoutRef.current) clearTimeout(globalTimeoutRef.current);
          frame?.contentWindow?.postMessage(
            { type: "xray", enabled: xrayRef.current },
            "*",
          );
          const epoch = epochRef.current;
          if (frame) void orchestrate(frame, epoch);
          break;
        }
        case "console":
          onConsoleRef.current?.({ level: data.level, text: data.text });
          break;
        case "runtime-error":
          onRuntimeErrorRef.current?.(data.message);
          break;
        case "loop-timer-start":
        case "loop-timer-fire":
          onLoopTimerRef.current?.({
            type: data.type,
            label: data.label,
            delay: data.delay,
          });
          break;
        case "validation-result": {
          const resolver = resolversRef.current.get(data.requestId);
          if (!resolver) return;
          resolversRef.current.delete(data.requestId);
          resolver(data.results);
          break;
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [timeoutMs, failRun]);

  const baseLayout: Layout | null =
    viewport === "fit"
      ? null
      : { width: VIEWPORT_DIMENSIONS[viewport].width, height: VIEWPORT_DIMENSIONS[viewport].height };
  const effectiveLayout = validationLayout ?? baseLayout;
  const scale = effectiveLayout && wrapperWidth > 0 ? wrapperWidth / effectiveLayout.width : 1;

  return (
    <div
      ref={wrapperRef}
      className="scroll-slim relative h-full w-full overflow-auto bg-white"
    >
      {srcDoc !== null ? (
        <div
          style={
            effectiveLayout
              ? {
                  width: effectiveLayout.width * scale,
                  height: effectiveLayout.height * scale,
                  position: "relative",
                }
              : { position: "relative", width: "100%", height: "100%" }
          }
        >
          <iframe
            ref={iframeRef}
            title="Preview hasil kode"
            sandbox="allow-scripts allow-forms"
            srcDoc={srcDoc}
            style={
              effectiveLayout
                ? {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: effectiveLayout.width,
                    height: effectiveLayout.height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    border: 0,
                    background: "white",
                  }
                : {
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                    background: "white",
                  }
            }
          />
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/40 p-8 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Preview Standby
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            Tekan <span className="font-semibold text-primary">Deploy Code</span> untuk
            mengeksekusi kode-mu di sandbox, atau mulai mengetik untuk pratinjau otomatis.
          </p>
        </div>
      )}

      {running && (
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-white/30 p-2">
          <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-white/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary shadow-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            Menjalankan…
          </span>
        </div>
      )}
    </div>
  );
}
