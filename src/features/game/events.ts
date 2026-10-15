/**
 * Bus event React <-> layer game.
 *
 * M1: didengarkan oleh <GamePanel /> berbasis React.
 * M2: Phaser.js mendengarkan event yang sama, sehingga penggantian
 * engine visual tidak menyentuh komponen lain.
 */
export interface GameEventMap {
  "quest:started": { questId: string; title: string };
  "quest:completed": {
    questId: string;
    title: string;
    visualHook: string;
    visualNote: string;
    coins: number;
    xp: number;
  };
  "quest:failed": { questId: string; failedCount: number };
  "bug:spawn": { questId: string };
}

type Handler<T> = (payload: T) => void;

class GameEventBus {
  private handlers = new Map<keyof GameEventMap, Set<(payload: unknown) => void>>();

  on<K extends keyof GameEventMap>(event: K, handler: Handler<GameEventMap[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    const stored = handler as (payload: unknown) => void;
    set.add(stored);
    return () => {
      set.delete(stored);
    };
  }

  emit<K extends keyof GameEventMap>(event: K, payload: GameEventMap[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.forEach((handler) => {
      handler(payload);
    });
  }
}

export const gameEvents = new GameEventBus();
