"use client";

import Editor, { type BeforeMount, type Monaco } from "@monaco-editor/react";

export interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
}

const THEME_NAME = "startup-tycoon-dark";

const handleBeforeMount: BeforeMount = (monaco: Monaco) => {
  monaco.editor.defineTheme(THEME_NAME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5b7186", fontStyle: "italic" },
      { token: "tag", foreground: "67e8f9" },
      { token: "attribute.name", foreground: "c4b5fd" },
      { token: "attribute.value", foreground: "fbbf24" },
      { token: "string", foreground: "86efac" },
      { token: "keyword", foreground: "f0abfc" },
      { token: "number", foreground: "fbbf24" },
    ],
    colors: {
      "editor.background": "#0b0f16",
      "editor.foreground": "#dbe7f3",
      "editor.lineHighlightBackground": "#111a26",
      "editorLineNumber.foreground": "#3d4d63",
      "editorLineNumber.activeForeground": "#7dd3fc",
      "editorCursor.foreground": "#22d3ee",
      "editor.selectionBackground": "#164e6355",
      "editorIndentGuide.background1": "#15202e",
      "editorIndentGuide.activeBackground1": "#2b3f56",
      "editorWidget.background": "#0f1620",
      "editorWidget.border": "#1e2b3c",
      "scrollbarSlider.background": "#1e2b3c66",
      "scrollbarSlider.hoverBackground": "#2b3f5699",
      "minimap.background": "#0b0f16",
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
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
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
