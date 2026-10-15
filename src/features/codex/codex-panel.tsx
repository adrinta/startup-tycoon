"use client";

import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { CODEX_ARTICLES, getCodexArticle, type CodexArticle } from "@/content/codex/articles";
import { Button } from "@/components/ui/button";

export interface CodexPanelProps {
  codexRefs: string[];
}

export function CodexPanel({ codexRefs }: CodexPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? getCodexArticle(selectedId) : undefined;

  if (selected) {
    return <CodexArticleView article={selected} onBack={() => setSelectedId(null)} />;
  }

  const missionArticles = codexRefs
    .map((ref) => getCodexArticle(ref))
    .filter((article): article is CodexArticle => article !== undefined);
  const otherArticles = CODEX_ARTICLES.filter((article) => !codexRefs.includes(article.id));

  return (
    <div className="scroll-slim h-full space-y-3 overflow-y-auto p-3">
      {missionArticles.length > 0 && (
        <section className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Materi untuk misi ini
            </span>
          </div>
          {missionArticles.map((article) => (
            <ArticleButton key={article.id} article={article} onOpen={setSelectedId} highlight />
          ))}
        </section>
      )}

      <section className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3 text-muted-foreground" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Semua materi HTML
          </span>
        </div>
        {otherArticles.map((article) => (
          <ArticleButton key={article.id} article={article} onOpen={setSelectedId} />
        ))}
      </section>
    </div>
  );
}

function ArticleButton({
  article,
  onOpen,
  highlight = false,
}: {
  article: CodexArticle;
  onOpen: (id: string) => void;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(article.id)}
      className={
        highlight
          ? "w-full rounded-md border border-primary/35 bg-primary/[0.06] px-3 py-2 text-left transition-colors hover:bg-primary/[0.12]"
          : "w-full rounded-md border border-border/70 bg-card px-3 py-2 text-left transition-colors hover:bg-muted/60"
      }
    >
      <div className="text-[12px] font-medium leading-tight">{article.title}</div>
      <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
        {article.summary}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {article.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </button>
  );
}

function CodexArticleView({ article, onBack }: { article: CodexArticle; onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onBack}>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Button>
        <span className="truncate text-[12px] font-medium">{article.title}</span>
      </div>
      <div className="scroll-slim flex-1 space-y-4 overflow-y-auto p-3">
        <p className="text-[11.5px] leading-relaxed text-muted-foreground">{article.summary}</p>
        {article.sections.map((section, index) => (
          <section key={index} className="space-y-1.5">
            <h4 className="text-[12.5px] font-semibold text-primary/90">{section.heading}</h4>
            <p className="text-[11.5px] leading-relaxed text-muted-foreground">{section.body}</p>
            {section.code && (
              <pre className="scroll-slim overflow-x-auto rounded-md border border-border bg-muted/60 p-2.5 font-mono text-[10.5px] leading-relaxed text-foreground/90">
                {section.code}
              </pre>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
