"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildSrcdoc, type FileMap } from "@/features/sandbox/build-srcdoc";
import {
  isFrameMessage,
  type ConsoleEntry,
  type Objective,
  type ObjectiveResult,
} from "@/features/validation/types";

export interface SandboxFrameProps {
  files: FileMap;
  objectives: Objective[];
  /** Naikkan nilai ini untuk menjalankan ulang frame. */
  runToken: number;
  onConsole?: (entry: ConsoleEntry) => void;
  onRuntimeError?: (message: string) => void;
  onValidationResult?: (results: ObjectiveResult[]) => void;
  onTimeout?: () => void;
  timeoutMs?: number;
}

interface PendingRun {
  nonce: string;
  requestId: string;
}

export function SandboxFrame({
  files,
  objectives,
  runToken,
  onConsole,
  onRuntimeError,
  onValidationResult,
  onTimeout,
  timeoutMs = 3000,
}: SandboxFrameProps) {
  const [srcDoc, setSrcDoc] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingRef = useRef<PendingRun | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filesRef = useRef(files);
  const objectivesRef = useRef(objectives);
  const onConsoleRef = useRef(onConsole);
  const onRuntimeErrorRef = useRef(onRuntimeError);
  const onValidationResultRef = useRef(onValidationResult);
  const onTimeoutRef = useRef(onTimeout);

  // Sinkronkan nilai terbaru ke ref agar listener dan timer selalu
  // membaca data terkini tanpa perlu re-subscribe.
  useEffect(() => {
    filesRef.current = files;
    objectivesRef.current = objectives;
    onConsoleRef.current = onConsole;
    onRuntimeErrorRef.current = onRuntimeError;
    onValidationResultRef.current = onValidationResult;
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (runToken === 0) return;

    const nonce = crypto.randomUUID();
    const requestId = crypto.randomUUID();
    pendingRef.current = { nonce, requestId };

    setSrcDoc(buildSrcdoc(filesRef.current, nonce));
    setRunning(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      // Hentikan frame yang menggantung (mis. infinite loop) dengan
      // melepas iframe dari DOM sehingga konteksnya dimatikan.
      pendingRef.current = null;
      setSrcDoc(null);
      setRunning(false);
      onTimeoutRef.current?.();
    }, timeoutMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [runToken, timeoutMs]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const frame = iframeRef.current;
      if (frame && event.source && event.source !== frame.contentWindow) return;

      const data: unknown = event.data;
      if (!isFrameMessage(data)) return;

      const pending = pendingRef.current;
      if (!pending || data.nonce !== pending.nonce) return;

      switch (data.type) {
        case "ready": {
          frame?.contentWindow?.postMessage(
            {
              type: "validate",
              requestId: pending.requestId,
              objectives: objectivesRef.current,
            },
            "*",
          );
          break;
        }
        case "console":
          onConsoleRef.current?.({ level: data.level, text: data.text });
          break;
        case "runtime-error":
          onRuntimeErrorRef.current?.(data.message);
          break;
        case "validation-result": {
          if (data.requestId !== pending.requestId) return;
          pendingRef.current = null;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setRunning(false);
          onValidationResultRef.current?.(data.results);
          break;
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {srcDoc !== null ? (
        <iframe
          ref={iframeRef}
          title="Preview hasil kode"
          sandbox="allow-scripts allow-forms"
          srcDoc={srcDoc}
          className="h-full w-full border-0 bg-white"
        />
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
        <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-white/40 p-2">
          <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-white/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary shadow-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            Menjalankan…
          </span>
        </div>
      )}
    </div>
  );
}
