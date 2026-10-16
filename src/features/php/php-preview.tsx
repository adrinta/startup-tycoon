"use client";

import { useEffect, useRef, useState } from "react";

export interface PhpBridgeRequest {
  kind: "form" | "fetch";
  /** Untuk fetch: id balasan. */
  id?: string;
  method: "GET" | "POST";
  url: string;
  post?: Record<string, string>;
}

export interface PhpBridgeResponse {
  ok: boolean;
  status: number;
  text: string;
}

export interface PhpPreviewProps {
  /** HTML hasil eksekusi PHP (remount lewat `key` saat berubah dari audit). */
  html: string;
  styleCss?: string;
  onRequest: (request: PhpBridgeRequest) => Promise<PhpBridgeResponse>;
  /** Tahapan alur client-server untuk animasi: request → server → response. */
  onFlow?: (stage: "request" | "server" | "response") => void;
}

const BRIDGE_SOURCE = [
  "(function () {",
  "  function send(message) {",
  "    try { parent.postMessage(Object.assign({ __stPhpBridge: true }, message), '*'); } catch (e) {}",
  "  }",
  "  document.addEventListener('submit', function (event) {",
  "    event.preventDefault();",
  "    var form = event.target;",
  "    var data = {};",
  "    if (form && form.elements) {",
  "      for (var i = 0; i < form.elements.length; i += 1) {",
  "        var field = form.elements[i];",
  "        if (!field.name) continue;",
  "        if (field.type === 'checkbox' || field.type === 'radio') {",
  "          if (field.checked) data[field.name] = field.value;",
  "        } else {",
  "          data[field.name] = field.value;",
  "        }",
  "      }",
  "    }",
  "    send({",
  "      type: 'form',",
  "      method: (form.method || 'get').toUpperCase(),",
  "      url: form.getAttribute('action') || 'index.php',",
  "      post: data,",
  "    });",
  "  }, true);",
  "  var originalFetch = window.fetch ? window.fetch.bind(window) : null;",
  "  window.fetch = function (input, init) {",
  "    var url = typeof input === 'string' ? input : (input && input.url ? input.url : String(input));",
  "    if (/^https?:/i.test(url)) {",
  "      if (originalFetch) return originalFetch(input, init);",
  "      return Promise.reject(new Error('Jaringan luar tidak tersedia di sandbox PHP.'));",
  "    }",
  "    return new Promise(function (resolve, reject) {",
  "      var id = 'rf' + Math.random().toString(36).slice(2);",
  "      function listener(event) {",
  "        var data = event.data;",
  "        if (!data || data.__stPhpFetchResult !== true || data.id !== id) return;",
  "        window.removeEventListener('message', listener);",
  "        if (data.failed) { reject(new Error(data.message || 'Gagal memuat dari server.')); return; }",
  "        var text = data.text || '';",
  "        resolve({",
  "          ok: data.ok,",
  "          status: data.status,",
  "          text: function () { return Promise.resolve(text); },",
  "          json: function () {",
  "            try { return Promise.resolve(JSON.parse(text)); }",
  "            catch (error) { return Promise.reject(error); }",
  "          },",
  "        });",
  "      }",
  "      window.addEventListener('message', listener);",
  "      send({",
  "        type: 'fetch',",
  "        id: id,",
  "        url: url,",
  "        method: (init && init.method) || 'GET',",
  "        body: init && typeof init.body === 'string' ? init.body : null,",
  "      });",
  "    });",
  "  };",
  "})();",
].join("\n");

function escapeTagCloser(source: string, tag: "style" | "script"): string {
  return source.replace(new RegExp("</" + tag, "gi"), "<\\/" + tag);
}

/** Menyusun srcdoc preview: output PHP + style.css mahasiswa + jembatan form/fetch. */
export function composePhpPreviewHtml(displayHtml: string, styleCss?: string): string {
  const styleTag =
    styleCss && styleCss.trim() !== ""
      ? `<style>\n${escapeTagCloser(styleCss, "style")}\n</style>`
      : "";
  const bridgeScript = `<script>\n${BRIDGE_SOURCE}\n</script>`;

  let output = displayHtml;
  if (styleTag !== "") {
    if (/<\/head>/i.test(output)) {
      output = output.replace(/<\/head>/i, styleTag);
    } else {
      output = styleTag + output;
    }
  }
  if (/<\/body>/i.test(output)) {
    output = output.replace(/<\/body>/i, bridgeScript + "</body>");
  } else {
    output = output + bridgeScript;
  }
  return output;
}

function parsePostBody(body: string | null): Record<string, string> | undefined {
  if (!body) return undefined;
  const params = new URLSearchParams(body);
  const entries: Record<string, string> = {};
  params.forEach((value, key) => {
    entries[key] = value;
  });
  return entries;
}

interface BridgeMessage {
  __stPhpBridge?: boolean;
  type: "form" | "fetch";
  id?: string;
  method?: "GET" | "POST";
  url?: string;
  post?: Record<string, string>;
  body?: string | null;
}

export function PhpPreview({ html, styleCss, onRequest, onFlow }: PhpPreviewProps) {
  const [currentHtml, setCurrentHtml] = useState(html);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const onRequestRef = useRef(onRequest);
  const onFlowRef = useRef(onFlow);

  useEffect(() => {
    onRequestRef.current = onRequest;
    onFlowRef.current = onFlow;
  });

  useEffect(() => {
    async function handleMessage(event: MessageEvent) {
      const data = event.data as BridgeMessage | undefined;
      if (!data || data.__stPhpBridge !== true) return;
      const frame = iframeRef.current;
      if (frame && event.source && event.source !== frame.contentWindow) return;

      if (data.type === "form") {
        onFlowRef.current?.("request");
        await new Promise((resolve) => setTimeout(resolve, 140));
        onFlowRef.current?.("server");
        try {
          const result = await onRequestRef.current({
            kind: "form",
            method: data.method ?? "GET",
            url: data.url ?? "index.php",
            post: data.post,
          });
          onFlowRef.current?.("response");
          setCurrentHtml(composePhpPreviewHtml(result.text, styleCss));
        } catch {
          onFlowRef.current?.("response");
        }
        return;
      }

      if (data.type === "fetch" && typeof data.id === "string") {
        onFlowRef.current?.("request");
        await new Promise((resolve) => setTimeout(resolve, 140));
        onFlowRef.current?.("server");
        try {
          const result = await onRequestRef.current({
            kind: "fetch",
            method: data.method ?? "GET",
            url: data.url ?? "index.php",
            post: parsePostBody(data.body ?? null),
          });
          onFlowRef.current?.("response");
          frame?.contentWindow?.postMessage(
            {
              __stPhpFetchResult: true,
              id: data.id,
              ok: result.ok,
              status: result.status,
              text: result.text,
            },
            "*",
          );
        } catch (error) {
          frame?.contentWindow?.postMessage(
            {
              __stPhpFetchResult: true,
              id: data.id,
              failed: true,
              message: error instanceof Error ? error.message : String(error),
            },
            "*",
          );
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [styleCss]);

  return (
    <iframe
      ref={iframeRef}
      title="Preview hasil PHP"
      sandbox="allow-scripts allow-forms"
      srcDoc={composePhpPreviewHtml(currentHtml, styleCss)}
      className="h-full w-full border-0 bg-white"
    />
  );
}
