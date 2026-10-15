"use client";

import { useEffect, useRef } from "react";
import { GarageScene, type RoomState } from "./garage-scene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./room-layout";

export interface GameCanvasProps {
  roomState: RoomState;
  /** Naikkan untuk memunculkan gelombang bug baru di ruangan. */
  bugBurst: number;
  /** Naikkan untuk membersihkan semua bug (mis. setelah quest selesai). */
  clearBurst: number;
}

/**
 * Jembatan React <-> Phaser. Kontrak event/state tidak berubah dari M1:
 * React tetap pemegang sumber kebenaran (zustand), scene Phaser hanya
 * menyinkronkan visual lewat `syncRoom` (idempoten).
 */
export function GameCanvas({ roomState, bugBurst, clearBurst }: GameCanvasProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<import("phaser").Game | null>(null);
  const sceneRef = useRef<GarageScene | null>(null);

  useEffect(() => {
    let disposed = false;
    let game: import("phaser").Game | null = null;

    void (async () => {
      const PhaserModule = await import("phaser");
      const Phaser = PhaserModule.default;
      if (disposed || !holderRef.current) return;

      // State awal dibaca sekali dari render pertama; pembaruan berikutnya
      // selalu lewat efek syncRoom di bawah.
      const scene = new GarageScene(roomState);
      sceneRef.current = scene;

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: holderRef.current,
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundColor: "#eef3f9",
        scene: [scene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
        },
        render: { antialias: true },
        audio: { noAudio: true },
      });
      gameRef.current = game;
    })();

    return () => {
      disposed = true;
      sceneRef.current = null;
      game?.destroy(true);
      gameRef.current = null;
    };
    // Sengaja hanya dijalankan sekali; roomState terbaru disinkronkan oleh efek di bawah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current?.syncRoom(roomState);
  });

  useEffect(() => {
    if (bugBurst > 0) sceneRef.current?.spawnBugs(2);
  }, [bugBurst]);

  useEffect(() => {
    if (clearBurst > 0) sceneRef.current?.clearBugs();
  }, [clearBurst]);

  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-[#eef3f9]">
      <div
        ref={holderRef}
        className="w-full"
        style={{ aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}` }}
      />
    </div>
  );
}
