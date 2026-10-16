/**
 * Tata letak ruangan (data murni, tanpa dependensi Phaser).
 *
 * - `hook`   : terbuka saat quest dengan visual hook tersebut selesai.
 * - `itemId` : terbuka saat item toko dengan id tersebut dibeli.
 * - `stage`  : panggung tempat properti tampil (default: kedua panggung untuk
 *              barang toko; properti cerita menempel pada panggungnya).
 * - `gx/gy`  : koordinat sel pada grid isometrik.
 */

export type RoomStage = "garage" | "coworking" | "tower";

export type PropBuilder =
  | "desk-monitor"
  | "banner"
  | "rack"
  | "whiteboard"
  | "printer"
  | "zones"
  | "trophy"
  | "rug"
  | "plant"
  | "chair"
  | "standing-lamp"
  | "espresso"
  | "cabinet"
  | "server-mini"
  | "neon-sign"
  | "beanbag"
  | "poster"
  | "wall-clock"
  | "cargo-shelf"
  | "tablet-stand"
  | "dashboard-screen"
  | "alarm-beacon"
  | "conveyor"
  | "ticker"
  | "gate-robot"
  | "antenna"
  | "shield-dome";

export interface PropDef {
  key: string;
  builder: PropBuilder;
  hook?: string;
  itemId?: string;
  gx: number;
  gy: number;
  stage?: RoomStage;
}

export const GRID_COLS = 5;
export const GRID_ROWS = 5;

/** Rasio kanvas logis Phaser (dipakai juga untuk aspek rasio wadah di React). */
export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 344;

export const ROOM_PROPS: PropDef[] = [
  // Dekorasi lantai (paling belakang; tampil di semua panggung).
  { key: "rug", builder: "rug", itemId: "karpet-motivasi", gx: 2.5, gy: 2.5 },

  // Babak 1 — Garasi Berdebu (HTML).
  { key: "monitor", builder: "desk-monitor", hook: "garage.monitor-on", gx: 1.5, gy: 1.5, stage: "garage" },
  { key: "banner", builder: "banner", hook: "garage.banner", gx: 2.5, gy: 0, stage: "garage" },
  { key: "rack", builder: "rack", hook: "garage.rack", gx: 3.5, gy: 1.3, stage: "garage" },
  { key: "whiteboard", builder: "whiteboard", hook: "garage.whiteboard", gx: 0, gy: 2.5, stage: "garage" },
  { key: "printer", builder: "printer", hook: "garage.printer", gx: 3.9, gy: 3.0, stage: "garage" },
  { key: "zones", builder: "zones", hook: "garage.zones", gx: 1.8, gy: 4.2, stage: "garage" },
  { key: "trophy", builder: "trophy", hook: "garage.audit", gx: 1.5, gy: 1.5, stage: "garage" },

  // Babak 2 — Co-Working Space (CSS).
  { key: "neon-sign", builder: "neon-sign", hook: "cowork.rebrand", gx: 2.5, gy: 0, stage: "coworking" },
  { key: "beanbag", builder: "beanbag", hook: "cowork.ergonomic", gx: 0.9, gy: 1.6, stage: "coworking" },
  { key: "poster", builder: "poster", hook: "cowork.typography", gx: 0, gy: 2.2, stage: "coworking" },
  { key: "wall-clock", builder: "wall-clock", hook: "cowork.lockdown", gx: 4.3, gy: 0, stage: "coworking" },
  { key: "cargo-shelf", builder: "cargo-shelf", hook: "cowork.flex", gx: 3.5, gy: 1.3, stage: "coworking" },
  { key: "tablet", builder: "tablet-stand", hook: "cowork.tablet", gx: 2.5, gy: 2.6, stage: "coworking" },
  { key: "trophy-pitch", builder: "trophy", hook: "cowork.pitch", gx: 1.4, gy: 2.4, stage: "coworking" },

  // Babak 3 — High-Rise Tower Lantai 15 (JavaScript).
  { key: "dashboard", builder: "dashboard-screen", hook: "tower.dashboard", gx: 2.5, gy: 0, stage: "tower" },
  { key: "alarm", builder: "alarm-beacon", hook: "tower.alarm", gx: 0, gy: 2.0, stage: "tower" },
  { key: "conveyor", builder: "conveyor", hook: "tower.conveyor", gx: 2.5, gy: 3.9, stage: "tower" },
  { key: "ticker", builder: "ticker", hook: "tower.ticker", gx: 0, gy: 3.6, stage: "tower" },
  { key: "gate-robot", builder: "gate-robot", hook: "tower.robot", gx: 1.3, gy: 1.7, stage: "tower" },
  { key: "antenna", builder: "antenna", hook: "tower.antenna", gx: 4.2, gy: 1.5, stage: "tower" },
  { key: "dome", builder: "shield-dome", hook: "tower.dome", gx: 2.5, gy: 2.5, stage: "tower" },

  // Barang toko (tampil di panggung mana pun).
  { key: "plant", builder: "plant", itemId: "tanaman-hias", gx: 0.7, gy: 4.3 },
  { key: "cabinet", builder: "cabinet", itemId: "lemari-arsip", gx: 4.3, gy: 1.9 },
  { key: "lamp", builder: "standing-lamp", itemId: "lampu-berdiri", gx: 0.7, gy: 2.4 },
  { key: "chair", builder: "chair", itemId: "kursi-ergonomis", gx: 2.6, gy: 1.4 },
  { key: "espresso", builder: "espresso", itemId: "mesin-espresso", gx: 4.8, gy: 3.6 },
  { key: "server", builder: "server-mini", itemId: "server-mini", gx: 0.6, gy: 1.3 },
];

export function propAppliesToStage(def: PropDef, stage: RoomStage): boolean {
  return def.stage === undefined || def.stage === stage;
}
