"use client";

import Editor, { type BeforeMount, type Monaco } from "@monaco-editor/react";

export interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const THEME_NAME = "startup-tycoon-light";

const handleBeforeMount: BeforeMount = (monaco: Monaco) => {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "tag", foreground: "0e7490" },
      { token: "attribute.name", foreground: "7c3aed" },
      { token: "attribute.value", foreground: "b45309" },
      { token: "string", foreground: "047857" },
      { token: "keyword", foreground: "a21caf" },
      { token: "number", foreground: "b45309" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1e293b",
      "editor.lineHighlightBackground": "#f1f5f9",
      "editorLineNumber.foreground": "#94a3b8",
      "editorLineNumber.activeForeground": "#0284c7",
      "editorCursor.foreground": "#0284c7",
      "editor.selectionBackground": "#bae6fd66",
      "editorIndentGuide.background1": "#e2e8f0",
      "editorIndentGuide.activeBackground1": "#94a3b8",
      "editorWidget.background": "#f8fafc",
      "editorWidget.border": "#e2e8f0",
      "scrollbarSlider.background": "#94a3b855",
      "scrollbarSlider.hoverBackground": "#64748b88",
      "minimap.background": "#ffffff",
    },
  });
};

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  return (
    <Editor
      value={value}
      language={language}
      theme={THEME_NAME}
      beforeMount={handleBeforeMount}
      onChange={(next) => onChange(next ?? "")}
      loading={
        <div className="flex h-full items-center justify-center bg-white text-xs text-muted-foreground">
          Menyiapkan editor…
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        lineHeight: 21,
        fontFamily:
          "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontLigatures: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: "on",
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: "all",
        cursorBlinking: "smooth",
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        scrollbar: {
          verticalScrollbarSize: 10,
          horizontalScrollbarSize: 10,
        },
        overviewRulerLanes: 0,
      }}
    />
  );
}
