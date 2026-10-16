"use client";

import { Loader2, RefreshCcw, Server, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Quest, QuestFileMap } from "@/content/quests/schema";
import { getPhpEngine } from "@/features/php/engine";
import { evaluatePhpObjectives, type PhpScenarioOutput } from "@/features/php/php-evaluate";
import { PhpPreview, type PhpBridgeRequest, type PhpBridgeResponse } from "@/features/php/php-preview";
import type { ConsoleEntry, ObjectiveResult } from "@/features/validation/types";
import { cn } from "@/lib/utils";

export interface PhpSandboxRunnerProps {
  quest: Quest;
  files: QuestFileMap;
  runToken: number;
  onValidationResult: (results: ObjectiveResult[]) => void;
  onPhpLog?: (entry: ConsoleEntry) => void;
}

type PhpPhase = "idle" | "loading" | "running" | "ready" | "error";
type FlowStage = "idle" | "request" | "server" | "response";

const REQUEST_TIMEOUT_MS = 20000;
const BRIDGE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

/**
 * Orkestrator misi Babak 4: menjalankan berkas PHP pemain pada mesin
 * PHP-WASM (mengikuti skenario quest), menilai objektif, lalu menyajikan
 * hasilnya sebagai halaman yang bisa diuji langsung (form & fetch dijembatani
 * kembali ke mesin — memvisualisasikan alur client-server).
 */
export function PhpSandboxRunner({
  quest,
  files,
  runToken,
  onValidationResult,
  onPhpLog,
}: PhpSandboxRunnerProps) {
  const [phase, setPhase] = useState<PhpPhase>("idle");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [flowStage, setFlowStage] = useState<FlowStage>("idle");
  const [retryToken, setRetryToken] = useState(0);

  const epochRef = useRef(0);
  const engineLoadedRef = useRef(false);
  const questRef = useRef(quest);
  const filesRef = useRef(files);
  const onValidationResultRef = useRef(onValidationResult);
  const onPhpLogRef = useRef(onPhpLog);

  useEffect(() => {
    questRef.current = quest;
    filesRef.current = files;
    onValidationResultRef.current = onValidationResult;
    onPhpLogRef.current = onPhpLog;
  });

  const executeRun = useCallback(async (epoch: number) => {
    await Promise.resolve(); // keluar dari body effect sebelum setState pertama
    if (epochRef.current !== epoch) return;

    const engineLoaded = engineLoadedRef.current;
    setPhase(engineLoaded ? "running" : "loading");
    setErrorMessage("");

    try {
      const engine = await getPhpEngine();
      if (epochRef.current !== epoch) return;
      engineLoadedRef.current = true;
      setPhase("running");

      const currentQuest = questRef.current;
      const phpFiles: Record<string, string> = {};
      for (const [name, content] of Object.entries(filesRef.current)) {
        if (name.endsWith(".php")) phpFiles[name] = content;
      }

      const outputs = await withTimeout<PhpScenarioOutput[]>(
        engine.runScenarios(phpFiles, currentQuest.phpScenarios ?? []),
        REQUEST_TIMEOUT_MS,
        "Eksekusi PHP melebihi batas waktu (20 detik). Periksa kemungkinan perulangan tanpa henti.",
      );
      if (epochRef.current !== epoch) return;

      for (const output of outputs) {
        if (output.errors.trim() !== "") {
          const firstLine = output.errors.trim().split("\n")[0];
          onPhpLogRef.current?.({
            level: "error",
            text: `[${output.id}] ${firstLine}`,
          });
        }
      }

      const primary = outputs[0];
      if (primary) {
        setPreviewHtml(primary.text);
        setPreviewKey((key) => key + 1);
      }

      onValidationResultRef.current?.(
        evaluatePhpObjectives(currentQuest.objectives, outputs),
      );
      setPhase("ready");
    } catch (error) {
      if (epochRef.current !== epoch) return;
      setPhase("error");
      setErrorMessage(error instanceof Error ? error.message : String(error));
    }
  }, []);

  useEffect(() => {
    if (runToken === 0) return;
    epochRef.current += 1;
    const epoch = epochRef.current;
    void executeRun(epoch);
    return () => {
      if (epochRef.current === epoch) epochRef.current += 1;
    };
  }, [runToken, retryToken, executeRun]);

  const handleBridgeRequest = useCallback(
    async (request: PhpBridgeRequest): Promise<PhpBridgeResponse> => {
      const engine = await getPhpEngine();
      const result = await withTimeout(
        engine.request({
          method: request.method,
          url: request.url,
          post: request.post,
        }),
        BRIDGE_TIMEOUT_MS,
        "Request PHP melebihi batas waktu.",
      );
      return {
        ok: result.exitCode === 0,
        status: 200,
        text: result.text,
      };
    },
    [],
  );

  const busy = phase === "loading" || phase === "running";
  const statusLabel: Record<PhpPhase, string> = {
    idle: "menunggu deploy",
    loading: "memuat runtime (±25 MB, sekali saja)…",
    running: "menjalankan PHP…",
    ready: "siap",
    error: "gagal",
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-b border-border/70 bg-muted/30 px-2 py-1">
        <div className="flex items-center gap-1.5">
          <Server className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            PHP 8.3 · WebAssembly
          </span>
        </div>

        <div className="flex items-center gap-1">
          <FlowChip label="Client" active={flowStage === "request"} />
          <span className="text-muted-foreground/60">→</span>
          <FlowChip label="Mesin PHP" active={flowStage === "server"} />
          <span className="text-muted-foreground/60">→</span>
          <FlowChip label="Respons" active={flowStage === "response"} />
        </div>

        <div className="flex items-center gap-1.5">
          {phase === "error" ? (
            <button
              type="button"
              onClick={() => setRetryToken((token) => token + 1)}
              className="flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[10px] text-red-700 hover:bg-red-100"
            >
              <RefreshCcw className="h-3 w-3" /> Coba lagi
            </button>
          ) : (
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                phase === "ready" && "border-emerald-200 bg-emerald-50 text-emerald-700",
                busy && "border-primary/40 bg-primary/10 text-primary",
                phase === "idle" && "border-border bg-muted/50 text-muted-foreground",
              )}
            >
              {statusLabel[phase]}
            </span>
          )}
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        {phase === "loading" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/30 p-8 text-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              Menyiapkan mesin <span className="font-semibold text-foreground">PHP 8.3</span>{" "}
              di browser (WebAssembly). Pemuatan pertama ±25 MB dari server — setelah selesai
              semua misi PHP berjalan instan.
            </p>
          </div>
        )}

        {phase === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-red-50/60 p-8 text-center">
            <TriangleAlert className="h-5 w-5 text-red-500" />
            <p className="max-w-sm text-xs leading-relaxed text-red-700">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setRetryToken((token) => token + 1)}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/85"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> Coba lagi
            </button>
          </div>
        )}

        {(phase === "ready" || phase === "running") &&
          (previewHtml !== "" ? (
            <PhpPreview
              key={previewKey}
              html={previewHtml}
              styleCss={files["style.css"]}
              onRequest={handleBridgeRequest}
              onFlow={setFlowStage}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted/30 p-6 text-center">
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                Tekan <span className="font-semibold text-primary">Deploy Code</span> untuk
                menjalankan skrip PHP-mu di mesin WebAssembly.
              </p>
            </div>
          ))}

        {phase === "running" && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end bg-white/30 p-2">
            <span className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-white/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-primary shadow-sm">
              <Loader2 className="h-3 w-3 animate-spin" />
              Menjalankan PHP…
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowChip({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 font-mono text-[9.5px] transition-colors",
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border/70 bg-card text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}
