"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Download, Rocket, Trophy } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Quest, QuestFileMap } from "@/content/quests/schema";
import { AuthButton } from "@/features/auth/auth-button";
import { CodexPanel } from "@/features/codex/codex-panel";
import { FileTabs } from "@/features/editor/file-tabs";
import { EndingCinematic } from "@/features/export/ending-cinematic";
import { ExportPortfolioDialog } from "@/features/export/export-portfolio-dialog";
import { gameEvents } from "@/features/game/events";
import { GamePanel } from "@/features/game/game-panel";
import { StatsHud } from "@/features/game/stats-hud";
import { ObjectivesChecklist, type RunStatus } from "@/features/quests/objectives-checklist";
import { QuestBrief } from "@/features/quests/quest-brief";
import { QuestTicketList } from "@/features/quests/quest-ticket-list";
import { RewardDialog } from "@/features/quests/reward-dialog";
import { ConsolePanel } from "@/features/sandbox/console-panel";
import { EventLoopPanel, type LoopEvent } from "@/features/sandbox/event-loop-panel";
import { PreviewToolbar } from "@/features/sandbox/preview-toolbar";
import { SandboxFrame } from "@/features/sandbox/sandbox-frame";
import type { PreviewViewport } from "@/features/sandbox/viewport";
import { PhpSandboxRunner } from "@/features/php/php-sandbox";
import { useCloudSync } from "@/features/sync/use-cloud-sync";
import { sendAttempt } from "@/features/sync/send-attempt";
import {
  type ConsoleEntry,
  type LoopTimerEvent,
  type ObjectiveResult,
} from "@/features/validation/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questRepository } from "@/lib/services/quest-repository";
import { localProgressRepository } from "@/lib/services/progress-repository";
import { computeBuffs } from "@/content/shop/items";
import {
  useGameStore,
  useGameStoreHydrated,
  type QuestOutcome,
} from "@/lib/stores/game-store";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(
  () => import("@/features/editor/code-editor").then((mod) => mod.CodeEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-muted/40 font-mono text-[11px] text-muted-foreground">
        Menyiapkan editor kode…
      </div>
    ),
  },
);

const LANGUAGE_BY_FILE: Record<string, string> = {
  "index.html": "html",
  "style.css": "css",
  "app.js": "javascript",
  "index.php": "php",
};

const AUTO_RUN_DELAY_MS = 1000;
const RUN_TIMEOUT_MS = 3000;

/**
 * The Command Center — tiga panel: ruangan game (kiri), editor (tengah),
 * preview + audit + Holo-Codex (kanan).
 */
export function CommandCenter() {
  const hydrated = useGameStoreHydrated();
  const completedQuestIds = useGameStore((state) => state.completedQuestIds);
  const quests = useMemo(() => questRepository.list(), []);

  // Sinkronisasi progres ke cloud (aktif hanya saat Supabase dikonfigurasi & login).
  useCloudSync();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [workspaceEpoch, setWorkspaceEpoch] = useState(0);
  const [reward, setReward] = useState<{ outcome: QuestOutcome; quest: Quest } | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [showEnding, setShowEnding] = useState(false);

  // Misi aktif = pilihan pemain, atau misi pertama yang bisa dimainkan.
  const effectiveId = selectedId ?? questRepository.firstPlayable(completedQuestIds);
  const quest = questRepository.getById(effectiveId);

  if (!hydrated || !quest) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Memuat garasi…
        </div>
      </div>
    );
  }

  const nextQuestId = reward ? (questRepository.getNext(reward.quest.id)?.id ?? null) : null;

  return (
    <div className="flex h-screen min-w-[1200px] flex-col overflow-hidden bg-background text-foreground">
      <header className="flex shrink-0 items-center justify-between border-b border-border/70 bg-card/80 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded border border-primary/40 bg-primary/10 font-mono text-[13px] font-bold text-primary">
            S
          </div>
          <div>
            <div className="text-[13px] font-semibold tracking-[0.15em]">
              STARTUP <span className="text-primary">TYCOON</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {quest.chapter} · {quest.location}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <StatsHud
            onAfterReset={() => {
              setSelectedId(null);
              setWorkspaceEpoch((epoch) => epoch + 1);
            }}
          />
          <span className="h-6 w-px bg-border" />
          <button
            type="button"
            title="Ekspor Portofolio (.zip)"
            aria-label="Ekspor Portofolio"
            onClick={() => setExportOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </button>
          <Link
            href="/leaderboard"
            title="Papan Peringkat"
            aria-label="Papan Peringkat"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trophy className="h-4 w-4" />
          </Link>
          <AuthButton />
        </div>
      </header>

      <QuestWorkspace
        key={`${quest.id}:${workspaceEpoch}`}
        quest={quest}
        quests={quests}
        completedQuestIds={completedQuestIds}
        onSelectQuest={setSelectedId}
        onReward={({ outcome, quest: rewardedQuest }) => {
          if (rewardedQuest.id === "4.7") {
            setShowEnding(true);
          } else {
            setReward({ outcome, quest: rewardedQuest });
          }
        }}
      />

      <RewardDialog
        open={reward !== null}
        quest={reward?.quest ?? null}
        outcome={reward?.outcome ?? null}
        nextQuestId={nextQuestId}
        onClose={() => setReward(null)}
        onNextQuest={(questId) => {
          setReward(null);
          setSelectedId(questId);
        }}
      />

      <EndingCinematic
        open={showEnding}
        onOpenChange={setShowEnding}
        onExport={() => {
          setShowEnding(false);
          setExportOpen(true);
        }}
      />

      <ExportPortfolioDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}

interface QuestWorkspaceProps {
  quest: Quest;
  quests: Quest[];
  completedQuestIds: string[];
  onSelectQuest: (questId: string) => void;
  onReward: (reward: { outcome: QuestOutcome; quest: Quest }) => void;
}

/**
 * Ruang kerja satu misi. Di-remount (via `key`) setiap kali misi berganti,
 * sehingga seluruh state (draft, hasil audit, console, token eksekusi)
 * otomatis segar tanpa sinkronisasi effect.
 */
function QuestWorkspace({
  quest,
  quests,
  completedQuestIds,
  onSelectQuest,
  onReward,
}: QuestWorkspaceProps) {
  const [files, setFiles] = useState<QuestFileMap>(() => {
    const stored = useGameStore.getState().drafts[quest.id];
    return { ...quest.starterFiles, ...(stored ?? {}) };
  });
  const [activeFile, setActiveFile] = useState(
    () => Object.keys(quest.starterFiles)[0] ?? "index.html",
  );
  // runToken mulai dari 1: pratinjau otomatis berjalan begitu misi dibuka.
  const [runToken, setRunToken] = useState(1);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [results, setResults] = useState<ObjectiveResult[] | null>(null);
  const [consoleEntries, setConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [rightTab, setRightTab] = useState<"preview" | "console" | "codex">("preview");
  const [viewport, setViewport] = useState<PreviewViewport>(
    quest.responsivePreview ? "desktop" : "fit",
  );
  const [xrayEnabled, setXrayEnabled] = useState(false);
  const [fullAudit, setFullAudit] = useState(false);
  const [eventLoopEnabled, setEventLoopEnabled] = useState(false);
  const [loopEvents, setLoopEvents] = useState<LoopEvent[]>([]);
  const loopIdRef = useRef(0);

  const runModeRef = useRef<"auto" | "deploy">("auto");
  const autoRunTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ownedItemIds = useGameStore((state) => state.ownedItemIds);
  const buffs = useMemo(() => computeBuffs(ownedItemIds), [ownedItemIds]);
  const completed = completedQuestIds.includes(quest.id);
  const runTimeout = quest.validationTimeoutMs ?? RUN_TIMEOUT_MS;

  useEffect(() => {
    gameEvents.emit("quest:started", { questId: quest.id, title: quest.title });
  }, [quest.id, quest.title]);

  useEffect(() => {
    return () => {
      if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    };
  }, []);

  const scheduleAutoRun = useCallback(() => {
    if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    // Boss fight (audit bertimer) hanya divalidasi saat Deploy.
    if (quest.isBoss) return;
    // Buff Mesin Espresso mempercepat siklus pratinjau otomatis.
    const fastPreview = computeBuffs(useGameStore.getState().ownedItemIds).fastPreview;
    autoRunTimerRef.current = setTimeout(() => {
      runModeRef.current = "auto";
      setFullAudit(false);
      setConsoleEntries([]);
      setRunToken((token) => token + 1);
    }, fastPreview ? 600 : AUTO_RUN_DELAY_MS);
  }, [quest.isBoss]);

  function handleEditorChange(nextValue: string) {
    const nextFiles = { ...files, [activeFile]: nextValue };
    setFiles(nextFiles);
    localProgressRepository.saveDraft(quest.id, nextFiles);
    scheduleAutoRun();
  }

  const handleDeploy = useCallback(() => {
    if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
    runModeRef.current = "deploy";
    setFullAudit(true);
    setConsoleEntries([]);
    setStatus("running");
    setRunToken((token) => token + 1);
  }, []);

  /* Pintasan keyboard: Ctrl/Cmd + Enter untuk deploy. */
  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleDeploy();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [handleDeploy]);

  const handleConsole = useCallback((entry: ConsoleEntry) => {
    setConsoleEntries((current) => [...current, entry]);
  }, []);

  const handleRuntimeError = useCallback((message: string) => {
    setConsoleEntries((current) => [...current, { level: "error", text: message }]);
  }, []);

  const handlePhpLog = useCallback((entry: ConsoleEntry) => {
    setConsoleEntries((current) => [...current, entry]);
  }, []);

  const handleTimeout = useCallback(() => {
    setConsoleEntries((current) => [
      ...current,
      {
        level: "error",
        text: "Eksekusi dihentikan: kode berjalan lebih dari 3 detik (kemungkinan infinite loop).",
      },
    ]);
    if (runModeRef.current === "deploy") {
      setStatus("timeout");
      gameEvents.emit("bug:spawn", { questId: quest.id });
    }
  }, [quest.id]);

  const handleLoopTimer = useCallback((event: LoopTimerEvent) => {
    loopIdRef.current += 1;
    setLoopEvents((current) => [
      ...current.slice(-19),
      {
        id: loopIdRef.current,
        kind: event.type === "loop-timer-start" ? "start" : "fire",
        label: event.label,
        delay: event.delay,
        at: Date.now(),
      },
    ]);
  }, []);

  const handleValidationResult = useCallback(
    (incoming: ObjectiveResult[]) => {
      setResults((previous) => {
        const merged = new Map((previous ?? []).map((result) => [result.id, result]));
        for (const result of incoming) merged.set(result.id, result);
        return quest.objectives
          .filter((objective) => merged.has(objective.id))
          .map((objective) => merged.get(objective.id) as ObjectiveResult);
      });

      const allPassed = incoming.length > 0 && incoming.every((result) => result.passed);
      if (runModeRef.current !== "deploy") return;

      // Metrik dashboard pengajar (tanpa memblokir alur gim).
      sendAttempt(quest.id, allPassed);

      if (allPassed) {
        const outcome = localProgressRepository.completeQuest({
          id: quest.id,
          rewards: quest.rewards,
        });
        setStatus("passed");
        setRightTab("preview");

        if (outcome.firstTime) {
          gameEvents.emit("quest:completed", {
            questId: quest.id,
            title: quest.title,
            visualHook: quest.visualHook,
            visualNote: quest.visualNote,
            coins: outcome.coins,
            xp: outcome.xp,
          });
          onReward({ outcome, quest });
        }
      } else {
        const failedCount = incoming.filter((result) => !result.passed).length;
        setStatus("failed");
        gameEvents.emit("quest:failed", { questId: quest.id, failedCount });
        gameEvents.emit("bug:spawn", { questId: quest.id });
      }
    },
    [quest, onReward],
  );

  const allObjectivesPassed =
    results !== null &&
    results.length === quest.objectives.length &&
    results.every((result) => result.passed);

  const fileNames = Object.keys(quest.starterFiles);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[320px_minmax(430px,1fr)_minmax(400px,44%)]">
      <aside className="flex min-h-0 flex-col border-r border-border/60">
        <GamePanel
          activeQuestTitle={quest.title}
          activeQuestHint={quest.hint ?? null}
          activeQuestPhase={quest.phase}
          location={quest.location}
        />
        <QuestTicketList
          quests={quests}
          selectedId={quest.id}
          completedQuestIds={completedQuestIds}
          onSelect={onSelectQuest}
        />
      </aside>

      <main className="flex min-h-0 flex-col border-r border-border/60">
        <div className="scroll-slim max-h-[36%] shrink-0 overflow-y-auto border-b border-border/60">
          <QuestBrief quest={quest} completed={completed} />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <FileTabs files={fileNames} active={activeFile} onSelect={setActiveFile} />
          <div className="min-h-0 flex-1">
            <CodeEditor
              value={files[activeFile] ?? ""}
              language={LANGUAGE_BY_FILE[activeFile] ?? "html"}
              onChange={handleEditorChange}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <StatusChip status={status} completed={completed} />
              {allObjectivesPassed && !completed && status !== "passed" && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">
                  ✓ semua objektif siap — deploy untuk klaim
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {quest.validationTimeoutMs !== undefined && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[10px] text-amber-700">
                  audit ±{Math.round(runTimeout / 1000)} dtk
                </span>
              )}
              <span className="hidden font-mono text-[10px] text-muted-foreground/90 xl:inline">
                Ctrl/⌘ + Enter
              </span>
              <Button
                onClick={handleDeploy}
                disabled={status === "running"}
                className="gap-2 bg-primary font-semibold text-primary-foreground shadow-[0_8px_18px_-6px] shadow-primary/40 hover:bg-primary/85"
              >
                <Rocket className="h-4 w-4" />
                Deploy Code
              </Button>
            </div>
          </div>
        </div>
      </main>

      <section className="flex min-h-0 flex-col">
        <div className="scroll-slim max-h-[42%] shrink-0 overflow-y-auto border-b border-border/60">
          <ObjectivesChecklist
            objectives={quest.objectives}
            results={results}
            status={status}
            completed={completed}
            hint={buffs.hintUnlocked ? (quest.hint ?? null) : null}
          />
        </div>

        <Tabs
          value={rightTab}
          onValueChange={(value) => setRightTab(value as typeof rightTab)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="shrink-0 border-b border-border/60 px-2 pt-1.5">
            <TabsList variant="line" className="h-8 w-full justify-start">
              <TabsTrigger value="preview" className="flex-none px-3 text-foreground/75">
                Preview
              </TabsTrigger>
              <TabsTrigger value="console" className="flex-none px-3 text-foreground/75">
                Console{consoleEntries.length > 0 ? ` (${consoleEntries.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="codex" className="flex-none px-3 text-foreground/75">
                Holo-Codex
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="min-h-0 flex-1 overflow-hidden">
            {quest.phase === 4 ? (
              <PhpSandboxRunner
                quest={quest}
                files={files}
                runToken={runToken}
                onValidationResult={handleValidationResult}
                onPhpLog={handlePhpLog}
              />
            ) : (
              <div className="flex h-full min-h-0 flex-col">
                <PreviewToolbar
                  viewport={viewport}
                  onViewportChange={setViewport}
                  xray={xrayEnabled}
                  onXrayChange={setXrayEnabled}
                  eventLoop={eventLoopEnabled}
                  onEventLoopChange={setEventLoopEnabled}
                  showEventLoop={quest.phase >= 3}
                />
                {eventLoopEnabled && <EventLoopPanel events={loopEvents} />}
                <div className="min-h-0 flex-1">
                  <SandboxFrame
                    files={files}
                    objectives={quest.objectives}
                    runToken={runToken}
                    timeoutMs={runTimeout}
                    fullAudit={fullAudit}
                    viewport={viewport}
                    xrayEnabled={xrayEnabled}
                    mocks={quest.mocks}
                    onConsole={handleConsole}
                    onRuntimeError={handleRuntimeError}
                    onValidationResult={handleValidationResult}
                    onTimeout={handleTimeout}
                    onLoopTimer={handleLoopTimer}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="console" className="min-h-0 flex-1 overflow-hidden">
            <ConsolePanel entries={consoleEntries} />
          </TabsContent>
          <TabsContent value="codex" className="min-h-0 flex-1 overflow-hidden">
            <CodexPanel codexRefs={quest.codexRefs} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function StatusChip({ status, completed }: { status: RunStatus; completed: boolean }) {
  const base =
    "rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider";
  if (status === "running") {
    return (
      <span className={cn(base, "border-primary/40 bg-primary/10 text-primary")}>
        menjalankan…
      </span>
    );
  }
  if (status === "passed") {
    return (
      <span className={cn(base, "border-emerald-200 bg-emerald-50 text-emerald-700")}>
        {completed ? "selesai · reward diklaim" : "lolos audit"}
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className={cn(base, "border-red-200 bg-red-50 text-red-700")}>
        audit gagal
      </span>
    );
  }
  if (status === "timeout") {
    return (
      <span className={cn(base, "border-amber-200 bg-amber-50 text-amber-700")}>
        timeout
      </span>
    );
  }
  return (
    <span className={cn(base, "border-border bg-muted/50 text-muted-foreground")}>
      {completed ? "selesai" : "menunggu deploy"}
    </span>
  );
}
