/**
 * Tata letak ruangan garasi (data murni, tanpa dependensi Phaser).
 *
 * - `hook`   : terbuka saat quest dengan visual hook tersebut selesai.
 * - `itemId` : terbuka saat item toko dengan id tersebut dibeli.
 * - `gx/gy`  : koordinat sel pada grid isometrik (0..5).
 */

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
  | "server-mini";

export interface PropDef {
  key: string;
  builder: PropBuilder;
  hook?: string;
  itemId?: string;
  gx: number;
  gy: number;
}

export const GRID_COLS = 5;
export const GRID_ROWS = 5;

/** Rasio kanvas logis Phaser (dipakai juga untuk aspek rasio wadah di React). */
export const CANVAS_WIDTH = 320;
export const CANVAS_HEIGHT = 344;

export const ROOM_PROPS: PropDef[] = [
  // Dekorasi lantai (paling belakang).
  { key: "rug", builder: "rug", itemId: "karpet-motivasi", gx: 2.5, gy: 2.5 },

  // Progres Babak 1 (Bab 1.1 - 1.7).
  { key: "monitor", builder: "desk-monitor", hook: "garage.monitor-on", gx: 1.5, gy: 1.5 },
  { key: "banner", builder: "banner", hook: "garage.banner", gx: 2.5, gy: 0 },
  { key: "rack", builder: "rack", hook: "garage.rack", gx: 3.5, gy: 1.3 },
  { key: "whiteboard", builder: "whiteboard", hook: "garage.whiteboard", gx: 0, gy: 2.5 },
  { key: "printer", builder: "printer", hook: "garage.printer", gx: 3.9, gy: 3.0 },
  { key: "zones", builder: "zones", hook: "garage.zones", gx: 1.8, gy: 4.2 },
  { key: "trophy", builder: "trophy", hook: "garage.audit", gx: 1.5, gy: 1.5 },

  // Barang toko.
  { key: "plant", builder: "plant", itemId: "tanaman-hias", gx: 0.7, gy: 4.3 },
  { key: "cabinet", builder: "cabinet", itemId: "lemari-arsip", gx: 4.3, gy: 1.9 },
  { key: "lamp", builder: "standing-lamp", itemId: "lampu-berdiri", gx: 0.7, gy: 2.4 },
  { key: "chair", builder: "chair", itemId: "kursi-ergonomis", gx: 2.6, gy: 1.4 },
  { key: "espresso", builder: "espresso", itemId: "mesin-espresso", gx: 4.8, gy: 3.6 },
  { key: "server", builder: "server-mini", itemId: "server-mini", gx: 0.6, gy: 1.3 },
];
