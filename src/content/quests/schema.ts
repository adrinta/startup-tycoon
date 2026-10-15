import { z } from "zod";

/**
 * Aturan validasi misi. Semuanya JSON-serializable karena dikirim ke
 * sandbox iframe melalui postMessage dan disimpan pada kolom
 * `validation_rules` (jsonb) di database pada Fase 3.
 */
export const ruleSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("doctype"),
  }),
  z.object({
    kind: z.literal("dom"),
    selector: z.string().min(1),
    min: z.number().int().min(0).optional(),
    max: z.number().int().min(0).optional(),
  }),
  z.object({
    kind: z.literal("attr"),
    selector: z.string().min(1),
    attr: z.string().min(1),
    /** "some" = minimal satu elemen memenuhi, "all" = semua elemen harus memenuhi. */
    mode: z.enum(["some", "all"]).optional(),
    equals: z.string().optional(),
    contains: z.string().optional(),
    /** Case-insensitive, default true. */
    ci: z.boolean().optional(),
    /** Default: true bila equals/contains tidak diberikan. */
    nonEmpty: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("text"),
    selector: z.string().min(1),
    mode: z.enum(["some", "all"]).optional(),
    contains: z.string().optional(),
    equals: z.string().optional(),
    ci: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("childOf"),
    selector: z.string().min(1),
    ancestor: z.string().min(1),
  }),
  z.object({
    kind: z.literal("order"),
    first: z.string().min(1),
    then: z.string().min(1),
  }),
]);

export const objectiveSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  rule: ruleSchema,
});

export const questSchema = z.object({
  /** Format "babak.nomor", misal "1.3" atau "1.7" untuk boss fight. */
  id: z.string().regex(/^\d+\.\d+$/),
  order: z.number().int().min(1),
  phase: z.number().int().min(1).max(4),
  chapter: z.string().min(1),
  location: z.string().min(1),
  isBoss: z.boolean().default(false),
  title: z.string().min(1),
  client: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    avatar: z.string().min(1),
  }),
  brief: z.string().min(1),
  /** Petunjuk opsional — hanya ditampilkan bila pemain punya buff "hint". */
  hint: z.string().optional(),
  instructions: z.array(z.string().min(1)).min(1),
  codexRefs: z.array(z.string()),
  starterFiles: z.record(z.string(), z.string()),
  objectives: z.array(objectiveSchema).min(1),
  rewards: z.object({
    coins: z.number().int().min(0),
    xp: z.number().int().min(0),
  }),
  /** Kunci event untuk animasi di GamePanel/Phaser. */
  visualHook: z.string().min(1),
  /** Teks feed yang muncul di panel game saat misi selesai. */
  visualNote: z.string().min(1),
});

export type Rule = z.infer<typeof ruleSchema>;
export type Objective = z.infer<typeof objectiveSchema>;
export type Quest = z.infer<typeof questSchema>;
export type QuestFileMap = Record<string, string>;
