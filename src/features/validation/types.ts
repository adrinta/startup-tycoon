import type { Objective, Rule } from "@/content/quests/schema";

export type { Objective, Rule };

/**
 * Hasil evaluasi satu objective di dalam sandbox iframe.
 * Dikirim kembali ke parent melalui postMessage.
 */
export interface ObjectiveResult {
  id: string;
  passed: boolean;
  /** Penjelasan ramah tanpa spoiler jawaban, misal: "atribut alt masih kosong". */
  detail?: string;
}

/** Level konsol yang dikirim dari sandbox. */
export type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";

export const CONSOLE_LEVELS: ConsoleLevel[] = ["log", "info", "warn", "error", "debug"];

export interface ConsoleEntry {
  level: ConsoleLevel;
  text: string;
}

/* ------------------------------------------------------------------ */
/* Protokol pesan iframe <-> parent                                    */
/* ------------------------------------------------------------------ */

export interface FrameReadyMessage {
  __st: true;
  nonce: string;
  type: "ready";
}

export interface FrameConsoleMessage {
  __st: true;
  nonce: string;
  type: "console";
  level: ConsoleLevel;
  text: string;
}

export interface FrameRuntimeErrorMessage {
  __st: true;
  nonce: string;
  type: "runtime-error";
  message: string;
}

export interface FrameValidationResultMessage {
  __st: true;
  nonce: string;
  type: "validation-result";
  requestId: string;
  results: ObjectiveResult[];
}

export interface FrameLoopTimerMessage {
  __st: true;
  nonce: string;
  type: "loop-timer-start" | "loop-timer-fire";
  label: string;
  delay?: number;
}

export type FrameMessage =
  | FrameReadyMessage
  | FrameConsoleMessage
  | FrameRuntimeErrorMessage
  | FrameValidationResultMessage
  | FrameLoopTimerMessage;

/** Event instrumentasi setTimeout untuk visualizer Event Loop. */
export interface LoopTimerEvent {
  type: "loop-timer-start" | "loop-timer-fire";
  label: string;
  delay?: number;
}

export interface ValidateRequestMessage {
  type: "validate";
  requestId: string;
  objectives: Objective[];
}

/**
 * Validasi bentuk pesan yang masuk dari iframe. Karena kode mahasiswa
 * berjalan di dalam iframe tersebut, semua pesan diperlakukan sebagai
 * data tidak tepercaya.
 */
export function isFrameMessage(value: unknown): value is FrameMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  if (message.__st !== true) return false;
  if (typeof message.nonce !== "string") return false;

  switch (message.type) {
    case "ready":
      return true;
    case "console":
      return (
        typeof message.level === "string" &&
        (CONSOLE_LEVELS as string[]).includes(message.level) &&
        typeof message.text === "string"
      );
    case "runtime-error":
      return typeof message.message === "string";
    case "validation-result":
      return typeof message.requestId === "string" && Array.isArray(message.results);
    case "loop-timer-start":
    case "loop-timer-fire":
      return typeof message.label === "string";
    default:
      return false;
  }
}
