import Phaser from "phaser";
import { computeBuffs, type BuffTotals } from "@/content/shop/items";
import {
  CANVAS_WIDTH,
  GRID_COLS,
  GRID_ROWS,
  ROOM_PROPS,
  propAppliesToStage,
  type PropDef,
  type RoomStage,
} from "./room-layout";

export interface RoomState {
  completedHooks: string[];
  ownedItemIds: string[];
  activeQuestTitle: string | null;
  activeQuestHint: string | null;
  stage: RoomStage;
}

/* ----------------------------- Geometri isometrik ----------------------------- */

const TILE_W = 56;
const TILE_H = 28;
const ORIGIN_X = CANVAS_WIDTH / 2;
const ORIGIN_Y = 148;
const WALL_H = 92;

interface Pt {
  x: number;
  y: number;
}

interface IsoBox {
  backT: Pt;
  rightT: Pt;
  frontT: Pt;
  leftT: Pt;
  backB: Pt;
  rightB: Pt;
  frontB: Pt;
  leftB: Pt;
}

interface Palette {
  top: number;
  left: number;
  right: number;
}

function isoX(gx: number, gy: number): number {
  return ORIGIN_X + (gx - gy) * (TILE_W / 2);
}

function isoY(gx: number, gy: number, lift = 0): number {
  return ORIGIN_Y + (gx + gy) * (TILE_H / 2) - lift;
}

function wallPoint(axis: "left" | "right", u: number, h: number): Pt {
  if (axis === "right") {
    return { x: ORIGIN_X + u * (TILE_W / 2), y: ORIGIN_Y + u * (TILE_H / 2) - h };
  }
  return { x: ORIGIN_X - u * (TILE_W / 2), y: ORIGIN_Y + u * (TILE_H / 2) - h };
}

function ptLerp(a: Pt, b: Pt, t: number, lift = 0): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t - lift };
}

function fillQuad(g: Phaser.GameObjects.Graphics, points: Pt[], color: number, alpha = 1): void {
  g.fillStyle(color, alpha);
  g.fillPoints(points, true);
}

function isoBoxPoints(
  cx: number,
  cy: number,
  w: number,
  d: number,
  base: number,
  h: number,
): IsoBox {
  const hx = (w * TILE_W) / 2;
  const hy = (d * TILE_H) / 2;
  const t = base + h;
  return {
    backT: { x: cx, y: cy - hy - t },
    rightT: { x: cx + hx, y: cy - t },
    frontT: { x: cx, y: cy + hy - t },
    leftT: { x: cx - hx, y: cy - t },
    backB: { x: cx, y: cy - hy - base },
    rightB: { x: cx + hx, y: cy - base },
    frontB: { x: cx, y: cy + hy - base },
    leftB: { x: cx - hx, y: cy - base },
  };
}

function drawBox(g: Phaser.GameObjects.Graphics, box: IsoBox, palette: Palette): void {
  fillQuad(g, [box.leftT, box.frontT, box.frontB, box.leftB], palette.left);
  fillQuad(g, [box.rightT, box.frontT, box.frontB, box.rightB], palette.right);
  fillQuad(g, [box.backT, box.rightT, box.frontT, box.leftT], palette.top);
}

function drawIsoBox(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  w: number,
  d: number,
  base: number,
  h: number,
  palette: Palette,
): void {
  drawBox(g, isoBoxPoints(cx, cy, w, d, base, h), palette);
}

function shadow(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number): void {
  g.fillStyle(0x0f172a, 0.08);
  g.fillEllipse(x, y, w, h);
}

const PALETTES = {
  wood: { top: 0xd9b58c, left: 0xbf9569, right: 0xa67c52 },
  monitor: { top: 0x334155, left: 0x1f2a3a, right: 0x141c28 },
  metal: { top: 0xe2e8f0, left: 0xc3ced9, right: 0xa8b6c4 },
  slate: { top: 0x64748b, left: 0x4e5c70, right: 0x3c4a5c },
  server: { top: 0x334155, left: 0x212c3d, right: 0x161e2c },
  terracotta: { top: 0xd98a67, left: 0xbf7050, right: 0xa55b3d },
  amberBox: { top: 0xfbbf24, left: 0xe2a70e, right: 0xbf8a08 },
  cyanBox: { top: 0x67e8f9, left: 0x22d3ee, right: 0x0ea5e9 },
  redBox: { top: 0xfca5a5, left: 0xf87171, right: 0xef4444 },
  cabinet: { top: 0xb6c2d1, left: 0x94a3b8, right: 0x7b8a9e },
  espresso: { top: 0x475569, left: 0x334155, right: 0x26303f },
} as const;

const STAGE_PALETTES: Record<
  RoomStage,
  {
    floorA: number;
    floorB: number;
    floorLine: number;
    leftWall: number;
    rightWall: number;
    panelLine: number;
    rim: number;
  }
> = {
  garage: {
    floorA: 0xffffff,
    floorB: 0xeef3f9,
    floorLine: 0xdfe7f0,
    leftWall: 0xf1f5f9,
    rightWall: 0xe8edf4,
    panelLine: 0xd7dfe9,
    rim: 0xcbd5e1,
  },
  coworking: {
    floorA: 0xfdf7ef,
    floorB: 0xf4e9db,
    floorLine: 0xe8dac8,
    leftWall: 0xfaf6f0,
    rightWall: 0xf1e9df,
    panelLine: 0xe4d7c6,
    rim: 0xd8c8b2,
  },
  tower: {
    floorA: 0xeef4fa,
    floorB: 0xdfe9f4,
    floorLine: 0xcfdded,
    leftWall: 0xeef2f8,
    rightWall: 0xd9e4f0,
    panelLine: 0xc3d3e4,
    rim: 0xb3c6da,
  },
};

function depthFor(def: PropDef): number {
  if (
    def.builder === "banner" ||
    def.builder === "whiteboard" ||
    def.builder === "neon-sign" ||
    def.builder === "poster" ||
    def.builder === "wall-clock" ||
    def.builder === "dashboard-screen" ||
    def.builder === "ticker" ||
    def.builder === "alarm-beacon"
  ) {
    return -1;
  }
  if (def.builder === "rug") return 1;
  if (def.builder === "shield-dome") return 120;
  const base = 10 + (def.gx + def.gy) * 10;
  return def.builder === "trophy" ? base + 2 : base;
}

/* ---------------------------------- Scene ---------------------------------- */

export class GarageScene extends Phaser.Scene {
  private desired: RoomState;
  private ready = false;
  private stage: RoomStage = "garage";
  private baseLayers: Phaser.GameObjects.Graphics[] = [];
  private props = new Map<string, Phaser.GameObjects.Container>();
  private bugs: Phaser.GameObjects.Text[] = [];
  private ada?: Phaser.GameObjects.Container;
  private bubble?: Phaser.GameObjects.Container;
  private buffs: BuffTotals = computeBuffs([]);
  private activeQuestTitle: string | null = null;
  private activeQuestHint: string | null = null;

  constructor(initialState: RoomState) {
    super("garage");
    this.desired = initialState;
  }

  create(): void {
    this.stage = this.desired.stage;
    this.paintBase(this.stage);
    this.createAda();
    this.ready = true;
    this.applyState(this.desired, false);
  }

  /** Dipanggil React setiap kali progres/dekorasi berubah (idempoten). */
  syncRoom(state: RoomState): void {
    this.desired = state;
    if (!this.ready) return;
    this.applyState(state, true);
  }

  spawnBugs(count = 2): void {
    if (!this.ready) return;
    for (let i = 0; i < count; i += 1) {
      const bx = Phaser.Math.Between(60, 262);
      const by = Phaser.Math.Between(170, 266);
      const bug = this.add
        .text(bx, by, "🐛", { fontSize: "15px" })
        .setOrigin(0.5)
        .setDepth(200);
      this.tweens.add({
        targets: bug,
        x: bx + Phaser.Math.Between(-20, 20),
        y: by + Phaser.Math.Between(-9, 9),
        angle: Phaser.Math.Between(-16, 16),
        duration: Phaser.Math.Between(480, 760),
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
      this.time.delayedCall(6500, () => this.flyAway(bug));
      this.bugs.push(bug);
      if (this.bugs.length > 8) {
        const oldest = this.bugs.shift();
        oldest?.destroy();
      }
    }
  }

  clearBugs(): void {
    for (const bug of this.bugs) this.flyAway(bug);
    this.bugs = [];
  }

  private flyAway(bug: Phaser.GameObjects.Text): void {
    if (!bug.active) return;
    this.tweens.killTweensOf(bug);
    this.tweens.add({
      targets: bug,
      y: bug.y - 46,
      alpha: 0,
      duration: 480,
      ease: "Cubic.Out",
      onComplete: () => bug.destroy(),
    });
  }

  /* ------------------------------- State sync ------------------------------- */

  private applyState(state: RoomState, animate: boolean): void {
    this.buffs = computeBuffs(state.ownedItemIds);
    this.activeQuestTitle = state.activeQuestTitle;
    this.activeQuestHint = state.activeQuestHint;

    if (state.stage !== this.stage) {
      this.stage = state.stage;
      this.paintBase(this.stage);
    }

    const hooks = new Set(state.completedHooks);
    const items = new Set(state.ownedItemIds);

    const desiredKeys = new Set<string>();
    for (const def of ROOM_PROPS) {
      if (!propAppliesToStage(def, this.stage)) continue;
      const unlocked = def.hook
        ? hooks.has(def.hook)
        : def.itemId
          ? items.has(def.itemId)
          : false;
      if (unlocked) desiredKeys.add(def.key);
    }

    // Properti panggung lama dilepas (pindah lokasi kantor).
    for (const [key, container] of Array.from(this.props.entries())) {
      if (!desiredKeys.has(key)) {
        container.destroy();
        this.props.delete(key);
      }
    }

    for (const def of ROOM_PROPS) {
      if (!desiredKeys.has(def.key) || this.props.has(def.key)) continue;
      const container = this.buildProp(def);
      if (!container) continue;
      container.setDepth(depthFor(def));
      this.props.set(def.key, container);
      if (animate) this.animateAppear(container);
    }
  }

  private animateAppear(container: Phaser.GameObjects.Container): void {
    container.setScale(0.5).setAlpha(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      alpha: 1,
      duration: 420,
      ease: "Back.Out",
    });
    if (container.depth >= 0) {
      const ring = this.add.graphics();
      ring.lineStyle(2, 0x0ea5e9, 0.55);
      ring.strokeEllipse(0, 0, 34, 15);
      ring.setPosition(container.x, container.y + 2).setDepth(container.depth + 1);
      this.tweens.add({
        targets: ring,
        scale: 2.4,
        alpha: 0,
        duration: 620,
        ease: "Cubic.Out",
        onComplete: () => ring.destroy(),
      });
    }
  }

  /* ------------------------------ Ruangan dasar ----------------------------- */

  private paintBase(stage: RoomStage): void {
    for (const layer of this.baseLayers) layer.destroy();
    this.baseLayers = [];

    const palette = STAGE_PALETTES[stage];

    const floor = this.add.graphics().setDepth(-3);
    for (let gx = 0; gx < GRID_COLS; gx += 1) {
      for (let gy = 0; gy < GRID_ROWS; gy += 1) {
        const a: Pt = { x: isoX(gx, gy), y: isoY(gx, gy) };
        const b: Pt = { x: isoX(gx + 1, gy), y: isoY(gx + 1, gy) };
        const c: Pt = { x: isoX(gx + 1, gy + 1), y: isoY(gx + 1, gy + 1) };
        const d: Pt = { x: isoX(gx, gy + 1), y: isoY(gx, gy + 1) };
        floor.fillStyle((gx + gy) % 2 === 0 ? palette.floorA : palette.floorB, 1);
        floor.fillPoints([a, b, c, d], true);
        floor.lineStyle(1, palette.floorLine, 1);
        floor.strokePoints([a, b, c, d], true);
      }
    }

    const walls = this.add.graphics().setDepth(-2);
    fillQuad(
      walls,
      [
        wallPoint("left", 0, 0),
        wallPoint("left", GRID_ROWS, 0),
        wallPoint("left", GRID_ROWS, WALL_H),
        wallPoint("left", 0, WALL_H),
      ],
      palette.leftWall,
    );
    fillQuad(
      walls,
      [
        wallPoint("right", 0, 0),
        wallPoint("right", GRID_COLS, 0),
        wallPoint("right", GRID_COLS, WALL_H),
        wallPoint("right", 0, WALL_H),
      ],
      palette.rightWall,
    );

    // Garis panel dinding.
    walls.lineStyle(1, palette.panelLine, 1);
    for (let u = 1; u < GRID_ROWS; u += 1) {
      const p1 = wallPoint("left", u, 0);
      const p2 = wallPoint("left", u, WALL_H - 10);
      walls.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }
    for (let u = 1; u < GRID_COLS; u += 1) {
      const p1 = wallPoint("right", u, 0);
      const p2 = wallPoint("right", u, WALL_H - 10);
      walls.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }

    // Rim atas dinding.
    walls.lineStyle(2, palette.rim, 1);
    const leftRimA = wallPoint("left", 0, WALL_H);
    const leftRimB = wallPoint("left", GRID_ROWS, WALL_H);
    walls.lineBetween(leftRimA.x, leftRimA.y, leftRimB.x, leftRimB.y);
    const rightRimA = wallPoint("right", 0, WALL_H);
    const rightRimB = wallPoint("right", GRID_COLS, WALL_H);
    walls.lineBetween(rightRimA.x, rightRimA.y, rightRimB.x, rightRimB.y);

    this.baseLayers.push(floor, walls);
  }

  /* --------------------------------- Properti -------------------------------- */

  private buildProp(def: PropDef): Phaser.GameObjects.Container | null {
    switch (def.builder) {
      case "desk-monitor":
        return this.buildDeskMonitor(def.gx, def.gy);
      case "banner":
        return this.buildBanner(def.gx);
      case "whiteboard":
        return this.buildWhiteboard(def.gy);
      case "rack":
        return this.buildRack(def.gx, def.gy);
      case "printer":
        return this.buildPrinter(def.gx, def.gy);
      case "zones":
        return this.buildZones(def.gx, def.gy);
      case "trophy":
        return this.buildTrophy(def.gx, def.gy);
      case "rug":
        return this.buildRug(def.gx, def.gy);
      case "plant":
        return this.buildPlant(def.gx, def.gy);
      case "chair":
        return this.buildChair(def.gx, def.gy);
      case "standing-lamp":
        return this.buildLamp(def.gx, def.gy);
      case "espresso":
        return this.buildEspresso(def.gx, def.gy);
      case "cabinet":
        return this.buildCabinet(def.gx, def.gy);
      case "server-mini":
        return this.buildServer(def.gx, def.gy);
      case "neon-sign":
        return this.buildNeonSign(def.gx);
      case "beanbag":
        return this.buildBeanbag(def.gx, def.gy);
      case "poster":
        return this.buildPoster(def.gy);
      case "wall-clock":
        return this.buildWallClock(def.gx);
      case "cargo-shelf":
        return this.buildCargoShelf(def.gx, def.gy);
      case "tablet-stand":
        return this.buildTabletStand(def.gx, def.gy);
      case "dashboard-screen":
        return this.buildDashboardScreen(def.gx);
      case "alarm-beacon":
        return this.buildAlarmBeacon(def.gy);
      case "conveyor":
        return this.buildConveyor(def.gx, def.gy);
      case "ticker":
        return this.buildTicker(def.gy);
      case "gate-robot":
        return this.buildGateRobot(def.gx, def.gy);
      case "antenna":
        return this.buildAntenna(def.gx, def.gy);
      case "shield-dome":
        return this.buildShieldDome(def.gx, def.gy);
      default:
        return null;
    }
  }

  private buildDeskMonitor(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 58, 20);
    drawIsoBox(g, 0, 0, 1.05, 0.8, 0, 20, PALETTES.wood);

    const monitor = isoBoxPoints(0, -4, 0.5, 0.24, 20, 15);
    drawBox(g, monitor, PALETTES.monitor);

    const screen = [
      ptLerp(monitor.leftB, monitor.frontB, 0.18, 5),
      ptLerp(monitor.leftB, monitor.frontB, 0.82, 5),
      ptLerp(monitor.leftB, monitor.frontB, 0.82, 12),
      ptLerp(monitor.leftB, monitor.frontB, 0.18, 12),
    ];
    fillQuad(g, screen, 0x22d3ee, 0.92);
    c.add(g);

    const ledPos = ptLerp(monitor.leftB, monitor.frontB, 0.86, 4);
    const led = this.add.graphics();
    led.fillStyle(0x4ade80, 1);
    led.fillCircle(ledPos.x, ledPos.y, 1.6);
    c.add(led);
    this.tweens.add({ targets: led, alpha: 0.25, duration: 900, yoyo: true, repeat: -1 });
    return c;
  }

  private buildBanner(gx: number): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    const u1 = gx - 1.3;
    const u2 = gx + 1.3;
    const h1 = 30;
    const h2 = 74;

    const quad = [
      wallPoint("right", u1, h1),
      wallPoint("right", u2, h1),
      wallPoint("right", u2, h2),
      wallPoint("right", u1, h2),
    ];
    fillQuad(g, quad, 0x38bdf8);
    g.lineStyle(2, 0xffffff, 0.85);
    g.strokePoints(quad, true);

    const mid = wallPoint("right", gx, (h1 + h2) / 2);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(mid.x, mid.y, 9);
    g.fillStyle(0x0ea5e9, 1);
    g.fillCircle(mid.x, mid.y, 5);

    for (let i = 0; i < 5; i += 1) {
      const a = wallPoint("right", u1 + (i + 0.5) * ((u2 - u1) / 5), h1 + 5);
      g.fillStyle(0xffffff, 0.55);
      g.fillTriangle(a.x - 5, a.y - 4, a.x + 5, a.y - 4, a.x, a.y + 4);
    }
    return this.add.container(0, 0, [g]).setDepth(-1);
  }

  private buildWhiteboard(gy: number): Phaser.GameObjects.Container {
    const g = this.add.graphics();
    const u1 = gy - 1.35;
    const u2 = gy + 1.35;
    const h1 = 34;
    const h2 = 82;

    const quad = [
      wallPoint("left", u1, h1),
      wallPoint("left", u2, h1),
      wallPoint("left", u2, h2),
      wallPoint("left", u1, h2),
    ];
    fillQuad(g, quad, 0xffffff);
    g.lineStyle(2, 0xcbd5e1, 1);
    g.strokePoints(quad, true);

    // Coretan grafik: tiga batang + garis tren.
    const bars: Array<[number, number, number]> = [
      [0.22, 10, 0x22d3ee],
      [0.5, 16, 0x34d399],
      [0.78, 12, 0xfbbf24],
    ];
    for (const [pos, height, color] of bars) {
      const bx1 = u1 + (u2 - u1) * (pos - 0.09);
      const bx2 = u1 + (u2 - u1) * (pos + 0.09);
      fillQuad(
        g,
        [
          wallPoint("left", bx1, h1 + 6),
          wallPoint("left", bx2, h1 + 6),
          wallPoint("left", bx2, h1 + 6 + height),
          wallPoint("left", bx1, h1 + 6 + height),
        ],
        color,
        0.85,
      );
    }
    g.lineStyle(2, 0x0f172a, 0.35);
    const t1 = wallPoint("left", u1 + (u2 - u1) * 0.15, h2 - 8);
    const t2 = wallPoint("left", u1 + (u2 - u1) * 0.5, h2 - 4);
    const t3 = wallPoint("left", u1 + (u2 - u1) * 0.85, h2 - 10);
    g.lineBetween(t1.x, t1.y, t2.x, t2.y);
    g.lineBetween(t2.x, t2.y, t3.x, t3.y);
    return this.add.container(0, 0, [g]).setDepth(-1);
  }

  private buildRack(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 48, 16);
    drawIsoBox(g, 0, 0, 0.75, 0.42, 0, 34, PALETTES.metal);

    const box = isoBoxPoints(0, 0, 0.75, 0.42, 0, 34);
    for (const lift of [12, 22]) {
      const p1 = ptLerp(box.leftB, box.frontB, 0.12, lift);
      const p2 = ptLerp(box.leftB, box.frontB, 0.88, lift);
      g.lineStyle(1.5, 0x94a3b8, 0.9);
      g.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }
    drawIsoBox(g, -8, 0, 0.22, 0.3, 12, 8, PALETTES.amberBox);
    drawIsoBox(g, 10, -1, 0.22, 0.3, 12, 8, PALETTES.cyanBox);
    drawIsoBox(g, 0, 0, 0.24, 0.3, 0, 10, PALETTES.redBox);
    c.add(g);
    return c;
  }

  private buildPrinter(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 42, 14);
    drawIsoBox(g, 0, 0, 0.55, 0.5, 0, 14, PALETTES.metal);
    drawIsoBox(g, 0, -3, 0.26, 0.26, 14, 2, {
      top: 0xffffff,
      left: 0xf1f5f9,
      right: 0xe2e8f0,
    });
    c.add(g);
    return c;
  }

  private buildZones(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();

    const decal = (dx: number, dy: number) => {
      const hx = (0.44 * TILE_W) / 2;
      const hy = (0.44 * TILE_H) / 2;
      g.lineStyle(1.5, 0x0ea5e9, 0.5);
      g.strokePoints(
        [
          { x: dx, y: dy - hy },
          { x: dx + hx, y: dy },
          { x: dx, y: dy + hy },
          { x: dx - hx, y: dy },
        ],
        true,
      );
    };
    decal(0, 0);
    decal(-11.2, -22.4);

    shadow(g, 30, 8, 40, 13);
    drawIsoBox(g, 24, 6, 0.34, 0.34, 0, 10, PALETTES.amberBox);
    drawIsoBox(g, 26, 2, 0.3, 0.3, 10, 9, PALETTES.cyanBox);
    c.add(g);
    return c;
  }

  private buildTrophy(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy) + 12, isoY(gx, gy) + 4);
    const glow = this.add.graphics();
    glow.fillStyle(0xfbbf24, 0.2);
    glow.fillCircle(0, -48, 16);
    const trophy = this.add.text(0, -48, "🏆", { fontSize: "22px" }).setOrigin(0.5);
    c.add([glow, trophy]);
    this.tweens.add({
      targets: trophy,
      scale: 1.08,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    return c;
  }

  private buildRug(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    g.fillStyle(0x818cf8, 0.28);
    g.fillEllipse(0, 0, 148, 70);
    g.lineStyle(2, 0x6366f1, 0.45);
    g.strokeEllipse(0, 0, 148, 70);
    g.lineStyle(1.5, 0x6366f1, 0.3);
    g.strokeEllipse(0, 0, 104, 48);
    c.add(g);
    return c;
  }

  private buildPlant(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 30, 11);
    drawIsoBox(g, 0, 0, 0.34, 0.34, 0, 10, PALETTES.terracotta);
    g.fillStyle(0x15803d, 1);
    g.fillCircle(0, -14, 6);
    g.fillStyle(0x22c55e, 1);
    g.fillCircle(-5, -18, 7);
    g.fillStyle(0x16a34a, 1);
    g.fillCircle(4, -22, 8);
    c.add(g);
    return c;
  }

  private buildChair(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 30, 12);
    drawIsoBox(g, 0, 0, 0.45, 0.4, 0, 6, PALETTES.slate);
    drawIsoBox(g, 0, -7, 0.45, 0.1, 6, 16, PALETTES.espresso);
    c.add(g);
    return c;
  }

  private buildLamp(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 26, 10);
    drawIsoBox(g, 0, 0, 0.09, 0.09, 0, 44, PALETTES.slate);
    drawIsoBox(g, -2, -2, 0.34, 0.2, 44, 8, PALETTES.amberBox);
    g.fillStyle(0xfbbf24, 0.14);
    g.fillTriangle(-12, -42, -32, -14, 8, -14);
    c.add(g);
    return c;
  }

  private buildEspresso(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 34, 12);
    drawIsoBox(g, 0, 0, 0.42, 0.36, 0, 15, PALETTES.espresso);
    drawIsoBox(g, 0, 0, 0.12, 0.12, 15, 5, PALETTES.metal);
    g.fillStyle(0x22d3ee, 1);
    g.fillCircle(7, -11, 1.5);
    c.add(g);
    return c;
  }

  private buildCabinet(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 46, 15);
    drawIsoBox(g, 0, 0, 0.6, 0.4, 0, 28, PALETTES.cabinet);

    const box = isoBoxPoints(0, 0, 0.6, 0.4, 0, 28);
    g.lineStyle(1, 0x64748b, 0.8);
    for (const lift of [9, 18]) {
      const p1 = ptLerp(box.leftB, box.frontB, 0.15, lift);
      const p2 = ptLerp(box.leftB, box.frontB, 0.85, lift);
      g.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }
    c.add(g);
    return c;
  }

  private buildServer(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 40, 14);
    drawIsoBox(g, 0, 0, 0.5, 0.45, 0, 38, PALETTES.server);

    const box = isoBoxPoints(0, 0, 0.5, 0.45, 0, 38);
    const ledColors = [0x4ade80, 0x4ade80, 0x22d3ee, 0x4ade80];
    for (let i = 0; i < ledColors.length; i += 1) {
      const p = ptLerp(box.leftB, box.frontB, 0.3, 7 + i * 7);
      g.fillStyle(ledColors[i], 1);
      g.fillCircle(p.x, p.y, 1.8);
    }
    c.add(g);
    return c;
  }

  /* ----------------------------- Co-Working Space ---------------------------- */

  private buildNeonSign(gx: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const u1 = gx - 1.6;
    const u2 = gx + 1.6;
    const h1 = 36;
    const h2 = 74;

    const glow = this.add.graphics();
    fillQuad(
      glow,
      [
        wallPoint("right", u1 - 0.14, h1 - 6),
        wallPoint("right", u2 + 0.14, h1 - 6),
        wallPoint("right", u2 + 0.14, h2 + 6),
        wallPoint("right", u1 - 0.14, h2 + 6),
      ],
      0x22d3ee,
      0.22,
    );

    const g = this.add.graphics();
    const quad = [
      wallPoint("right", u1, h1),
      wallPoint("right", u2, h1),
      wallPoint("right", u2, h2),
      wallPoint("right", u1, h2),
    ];
    fillQuad(g, quad, 0x0f172a);
    g.lineStyle(2, 0x22d3ee, 0.9);
    g.strokePoints(quad, true);

    // Glyph "X" menyala.
    const a = wallPoint("right", u1 + (u2 - u1) * 0.32, h1 + 8);
    const b = wallPoint("right", u1 + (u2 - u1) * 0.68, h2 - 8);
    const cc = wallPoint("right", u1 + (u2 - u1) * 0.32, h2 - 8);
    const dd = wallPoint("right", u1 + (u2 - u1) * 0.68, h1 + 8);
    g.lineStyle(5, 0x67e8f9, 0.95);
    g.lineBetween(a.x, a.y, b.x, b.y);
    g.lineBetween(cc.x, cc.y, dd.x, dd.y);

    c.add([glow, g]);
    this.tweens.add({ targets: glow, alpha: 0.5, duration: 1100, yoyo: true, repeat: -1 });
    return c.setDepth(-1);
  }

  private buildBeanbag(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 3, 46, 16);
    g.fillStyle(0x818cf8, 1);
    g.fillEllipse(0, -8, 44, 28);
    g.fillStyle(0x6366f1, 1);
    g.fillEllipse(6, -4, 26, 16);
    g.lineStyle(2, 0x4f46e5, 0.6);
    g.strokeEllipse(0, -8, 44, 28);
    c.add(g);
    return c;
  }

  private buildPoster(gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    const u1 = gy - 1.1;
    const u2 = gy + 1.1;
    const h1 = 40;
    const h2 = 78;

    const quad = [
      wallPoint("left", u1, h1),
      wallPoint("left", u2, h1),
      wallPoint("left", u2, h2),
      wallPoint("left", u1, h2),
    ];
    fillQuad(g, quad, 0xfff7ed);
    g.lineStyle(2, 0xd9c9b4, 1);
    g.strokePoints(quad, true);

    // "Teks" poster: judul tebal + paragraf tipis.
    const line = (t: number, lift: number, width: number, color: number, alpha: number) => {
      const from = u1 + (u2 - u1) * (t - width / 2);
      const to = u1 + (u2 - u1) * (t + width / 2);
      fillQuad(
        g,
        [
          wallPoint("left", from, lift),
          wallPoint("left", to, lift),
          wallPoint("left", to, lift + 4),
          wallPoint("left", from, lift + 4),
        ],
        color,
        alpha,
      );
    };
    line(0.5, h2 - 14, 0.62, 0x334155, 0.9);
    line(0.5, h2 - 24, 0.72, 0x94a3b8, 0.9);
    line(0.42, h2 - 31, 0.56, 0x94a3b8, 0.8);

    const dot = wallPoint("left", u1 + (u2 - u1) * 0.82, h1 + 9);
    g.fillStyle(0x0ea5e9, 1);
    g.fillCircle(dot.x, dot.y, 4);

    c.add(g);
    return c.setDepth(-1);
  }

  private buildWallClock(gx: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    const center = wallPoint("right", gx, 60);

    g.fillStyle(0xffffff, 1);
    g.lineStyle(3, 0x475569, 1);
    g.fillCircle(center.x, center.y, 13);
    g.strokeCircle(center.x, center.y, 13);

    for (let i = 0; i < 4; i += 1) {
      const angle = (Math.PI / 2) * i;
      const tx = center.x + Math.cos(angle) * 11;
      const ty = center.y + Math.sin(angle) * 11;
      g.fillStyle(0x94a3b8, 1);
      g.fillCircle(tx, ty, 1.2);
    }

    g.lineStyle(2.5, 0x0f172a, 0.9);
    g.lineBetween(center.x, center.y, center.x + 6, center.y + 5);
    g.lineBetween(center.x, center.y, center.x - 1, center.y - 7);

    c.add(g);
    return c.setDepth(-1);
  }

  private buildCargoShelf(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 54, 17);
    drawIsoBox(g, 0, 0, 0.85, 0.5, 0, 38, PALETTES.metal);

    const box = isoBoxPoints(0, 0, 0.85, 0.5, 0, 38);
    for (const lift of [13, 25]) {
      const p1 = ptLerp(box.leftB, box.frontB, 0.08, lift);
      const p2 = ptLerp(box.leftB, box.frontB, 0.92, lift);
      g.lineStyle(1.5, 0x94a3b8, 0.9);
      g.lineBetween(p1.x, p1.y, p2.x, p2.y);
    }

    // Baris kargo tersusun rapi (flex/grid in action).
    drawIsoBox(g, -14, 0, 0.26, 0.34, 13, 10, PALETTES.amberBox);
    drawIsoBox(g, 4, -1, 0.26, 0.34, 13, 10, PALETTES.cyanBox);
    drawIsoBox(g, 16, 1, 0.26, 0.34, 13, 10, PALETTES.redBox);
    drawIsoBox(g, -8, 0, 0.26, 0.34, 25, 10, PALETTES.cyanBox);
    drawIsoBox(g, 10, 0, 0.26, 0.34, 25, 10, PALETTES.amberBox);
    drawIsoBox(g, 0, 0, 0.3, 0.32, 0, 12, PALETTES.redBox);

    c.add(g);
    return c;
  }

  private buildTabletStand(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 34, 12);
    drawIsoBox(g, 0, 0, 0.34, 0.28, 0, 8, PALETTES.server);
    drawIsoBox(g, 0, 0, 0.62, 0.08, 8, 34, {
      top: 0x0f172a,
      left: 0x38bdf8,
      right: 0x0b1220,
    });
    g.fillStyle(0xe0f2fe, 0.9);
    g.fillCircle(10, -26, 1.6);
    c.add(g);
    return c;
  }

  /* ---------------------------------- Tower Lantai 15 ---------------------------------- */

  private buildDashboardScreen(gx: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const u1 = gx - 1.7;
    const u2 = gx + 1.7;
    const h1 = 40;
    const h2 = 80;

    const g = this.add.graphics();
    const quad = [
      wallPoint("right", u1, h1),
      wallPoint("right", u2, h1),
      wallPoint("right", u2, h2),
      wallPoint("right", u1, h2),
    ];
    fillQuad(g, quad, 0x0f172a);
    g.lineStyle(2, 0x334155, 1);
    g.strokePoints(quad, true);

    // Grafik batang pendapatan.
    const bars: Array<[number, number, number]> = [
      [0.16, 12, 0x22d3ee],
      [0.34, 20, 0x34d399],
      [0.52, 15, 0x22d3ee],
      [0.7, 26, 0xfbbf24],
      [0.86, 22, 0x34d399],
    ];
    for (const [pos, height, color] of bars) {
      const bx1 = u1 + (u2 - u1) * (pos - 0.05);
      const bx2 = u1 + (u2 - u1) * (pos + 0.05);
      fillQuad(
        g,
        [
          wallPoint("right", bx1, h1 + 7),
          wallPoint("right", bx2, h1 + 7),
          wallPoint("right", bx2, h1 + 7 + height),
          wallPoint("right", bx1, h1 + 7 + height),
        ],
        color,
        0.9,
      );
    }

    // Judul gilir + indikator hidup.
    const title = wallPoint("right", gx - 1.1, h2 - 9);
    g.fillStyle(0x94a3b8, 0.9);
    g.fillCircle(title.x, title.y, 2.5);
    const live = wallPoint("right", gx + 1.2, h2 - 9);
    const liveDot = this.add.graphics();
    liveDot.fillStyle(0x4ade80, 1);
    liveDot.fillCircle(live.x, live.y, 3);
    this.tweens.add({ targets: liveDot, alpha: 0.35, duration: 800, yoyo: true, repeat: -1 });

    c.add([g, liveDot]);
    return c.setDepth(-1);
  }

  private buildAlarmBeacon(gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const g = this.add.graphics();
    const center = wallPoint("left", gy, 74);
    const glow = this.add.graphics();
    glow.fillStyle(0xef4444, 0.25);
    glow.fillCircle(center.x, center.y, 16);
    g.fillStyle(0xfecaca, 1);
    g.fillCircle(center.x, center.y, 9);
    g.fillStyle(0xef4444, 1);
    g.fillCircle(center.x, center.y, 6);
    g.lineStyle(2, 0xb91c1c, 1);
    g.strokeCircle(center.x, center.y, 9);
    c.add([glow, g]);
    this.tweens.add({ targets: glow, alpha: 0.9, duration: 700, yoyo: true, repeat: -1 });
    return c.setDepth(-1);
  }

  private buildConveyor(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 96, 24);
    drawIsoBox(g, 0, 0, 1.7, 0.5, 0, 8, PALETTES.slate);

    // Kargo berjalan di atas ban.
    drawIsoBox(g, -30, 0, 0.28, 0.34, 8, 11, PALETTES.amberBox);
    drawIsoBox(g, 4, -2, 0.28, 0.34, 8, 11, PALETTES.cyanBox);
    drawIsoBox(g, 30, 1, 0.28, 0.34, 8, 11, PALETTES.redBox);

    // Arah aliran.
    g.lineStyle(1.5, 0xe2e8f0, 0.8);
    for (let i = 0; i < 3; i += 1) {
      const x = -46 + i * 14;
      g.lineBetween(x, 10, x + 6, 13);
      g.lineBetween(x + 6, 13, x, 16);
    }
    c.add(g);
    return c;
  }

  private buildTicker(gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(0, 0);
    const u1 = gy - 1.6;
    const u2 = gy + 1.6;
    const h1 = 48;
    const h2 = 59;

    const g = this.add.graphics();
    const quad = [
      wallPoint("left", u1, h1),
      wallPoint("left", u2, h1),
      wallPoint("left", u2, h2),
      wallPoint("left", u1, h2),
    ];
    fillQuad(g, quad, 0x1e293b);

    const dots = this.add.graphics();
    const colors = [0x22d3ee, 0xfbbf24, 0x34d399, 0xf472b6, 0x22d3ee, 0xa78bfa];
    for (let i = 0; i < colors.length; i += 1) {
      const p = wallPoint("left", u1 + (u2 - u1) * (0.12 + i * 0.15), (h1 + h2) / 2);
      dots.fillStyle(colors[i], 1);
      dots.fillCircle(p.x, p.y, 2.4);
    }
    c.add([g, dots]);
    this.tweens.add({ targets: dots, alpha: 0.35, duration: 900, yoyo: true, repeat: -1 });
    return c.setDepth(-1);
  }

  private buildGateRobot(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 34, 12);
    drawIsoBox(g, 0, 0, 0.42, 0.4, 0, 22, PALETTES.slate);
    const head = isoBoxPoints(0, -2, 0.34, 0.28, 22, 13);
    drawBox(g, head, PALETTES.server);

    // Mata pemindai.
    const eyeLeft = ptLerp(head.leftB, head.frontB, 0.32, 7);
    const eyeRight = ptLerp(head.leftB, head.frontB, 0.62, 7);
    const eyes = this.add.graphics();
    eyes.fillStyle(0x22d3ee, 1);
    eyes.fillCircle(eyeLeft.x, eyeLeft.y, 2.2);
    eyes.fillCircle(eyeRight.x, eyeRight.y, 2.2);

    // Antena berkedip.
    drawIsoBox(g, 0, -2, 0.05, 0.05, 35, 8, PALETTES.slate);
    const tip = this.add.graphics();
    tip.fillStyle(0xef4444, 1);
    tip.fillCircle(0, -46, 2.4);

    c.add([g, eyes, tip]);
    this.tweens.add({ targets: tip, alpha: 0.3, duration: 650, yoyo: true, repeat: -1 });
    return c;
  }

  private buildAntenna(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const g = this.add.graphics();
    shadow(g, 0, 2, 30, 11);
    drawIsoBox(g, 0, 0, 0.12, 0.12, 0, 30, PALETTES.slate);

    // Piringan parabola (stilasi).
    g.fillStyle(0xdbeafe, 1);
    g.fillCircle(0, -38, 11);
    g.fillStyle(0x93c5fd, 1);
    g.fillCircle(-2, -36, 6);
    g.lineStyle(2, 0x64748b, 1);
    g.lineBetween(0, -30, 0, -38);
    g.lineBetween(0, -38, 8, -30);

    const blink = this.add.graphics();
    blink.fillStyle(0x22d3ee, 1);
    blink.fillCircle(8, -30, 2);
    c.add([g, blink]);
    this.tweens.add({ targets: blink, alpha: 0.25, duration: 750, yoyo: true, repeat: -1 });
    return c;
  }

  private buildShieldDome(gx: number, gy: number): Phaser.GameObjects.Container {
    const c = this.add.container(isoX(gx, gy), isoY(gx, gy));
    const dome = this.add.graphics();
    dome.fillStyle(0x38bdf8, 0.09);
    dome.fillEllipse(0, -34, 250, 130);
    dome.lineStyle(2, 0x38bdf8, 0.4);
    dome.strokeEllipse(0, -34, 250, 130);
    dome.lineStyle(1, 0x7dd3fc, 0.35);
    dome.strokeEllipse(0, -34, 190, 96);
    c.add(dome);
    this.tweens.add({
      targets: dome,
      alpha: 0.55,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
    return c;
  }

  /* ----------------------------------- Ada ----------------------------------- */

  private createAda(): void {
    const g = this.add.graphics();
    g.fillStyle(0x0f172a, 0.1);
    g.fillEllipse(0, 4, 34, 12);
    g.fillStyle(0xffffff, 1);
    g.lineStyle(2, 0x0ea5e9, 0.8);
    g.fillCircle(0, -30, 19);
    g.strokeCircle(0, -30, 19);

    const emoji = this.add.text(0, -30, "👩‍💻", { fontSize: "20px" }).setOrigin(0.5);
    const name = this.add
      .text(0, 6, "Ada", { fontSize: "10px", color: "#475569", fontStyle: "bold" })
      .setOrigin(0.5, 0);

    this.ada = this.add
      .container(isoX(4.2, 4.2), isoY(4.2, 4.2), [g, emoji, name])
      .setDepth(95);
    this.ada.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-23, -48, 46, 66),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.ada.on("pointerdown", () => this.toggleBubble());

    this.tweens.add({
      targets: emoji,
      y: -33,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  private toggleBubble(): void {
    if (this.bubble) {
      this.bubble.destroy();
      this.bubble = undefined;
      return;
    }

    const message = this.bubbleMessage();
    const text = this.add.text(0, 0, message, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      color: "#0f172a",
      wordWrap: { width: 190 },
      lineSpacing: 3,
    });
    const w = Math.ceil(Math.min(190, text.width)) + 22;
    const h = Math.ceil(text.height) + 18;
    text.setPosition(-w / 2 + 11, -h + 9);

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 0.98);
    g.lineStyle(1.5, 0x38bdf8, 0.9);
    g.fillRoundedRect(-w / 2, -h, w, h, 8);
    g.strokeRoundedRect(-w / 2, -h, w, h, 8);
    g.fillStyle(0xffffff, 0.98);
    g.fillTriangle(-6, -2, 6, -2, 0, 10);

    if (!this.ada) return;
    this.bubble = this.add
      .container(this.ada.x, this.ada.y - 62, [g, text])
      .setDepth(150);

    this.time.delayedCall(9000, () => {
      this.bubble?.destroy();
      this.bubble = undefined;
    });
  }

  private bubbleMessage(): string {
    if (this.buffs.hintUnlocked && this.activeQuestHint) {
      return `💡 Petunjuk "${this.activeQuestTitle ?? "misi ini"}": ${this.activeQuestHint}`;
    }
    if (this.activeQuestTitle) {
      return `Kamu sedang mengerjakan "${this.activeQuestTitle}". Tulis kodenya di panel tengah, lalu tekan Deploy Code. Aku di sini kalau butuh bantuan!`;
    }
    return "Halo Founder! Pilih salah satu tiket di daftar, lalu tulis kodenya di panel tengah.";
  }
}
