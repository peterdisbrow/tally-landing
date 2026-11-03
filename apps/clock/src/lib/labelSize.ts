/**
 * Label size for the text above / below the digits (clock name, status like RUNNING /
 * COUNTING TO / Paste Rundown link, AM/PM). Per clock, optional in saved configs:
 * a config without these fields gets the defaults below, so old saves keep loading.
 */
export type LabelSize = "s" | "m" | "l" | "xl";

export const LABEL_SIZES: { value: LabelSize; label: string; mult: number }[] = [
  { value: "s", label: "S", mult: 1 },     // the original small labels
  { value: "m", label: "M", mult: 1.5 },
  { value: "l", label: "L", mult: 2 },
  { value: "xl", label: "XL", mult: 3 },
];

export const DEFAULT_LABEL_SIZE: LabelSize = "m";
export const DEFAULT_SCALE_LABELS = true;

export const resolveLabelSize = (v: unknown): LabelSize =>
  LABEL_SIZES.some((s) => s.value === v) ? (v as LabelSize) : DEFAULT_LABEL_SIZE;

export const resolveScaleLabels = (v: unknown): boolean => (typeof v === "boolean" ? v : DEFAULT_SCALE_LABELS);

/** Line-height of the digits. The digit font's content box is about this tall, so labels sized and spaced from it never touch the glyphs. */
export const DIGIT_LINE = 1.3;

export type LabelPx = { name: number; sub: number; ampm: number };

/**
 * Pixel sizes for the three label kinds.
 * `fontSize` is the cell's digit size parameter (digits render at fontSize * 0.6 px).
 * With `scale` on, labels also grow with the digits: x1 up to a 100 fontSize cell,
 * then as (size/100)^0.75, capped at x2.8 (size 400), so a huge featured clock gets proportionally huge labels.
 * `cellHeight` (px, optional) keeps big labels from crowding the digits out of a short
 * cell: each label is capped at a share of the cell height (never below 9 px).
 */
export function labelPx(size: unknown, scale: unknown, fontSize: number, cellHeight?: number): LabelPx {
  const mult = LABEL_SIZES.find((s) => s.value === resolveLabelSize(size))!.mult;
  const follow = resolveScaleLabels(scale) ? Math.pow(Math.max(1, Math.min(4, fontSize / 100)), 0.75) : 1;
  const k = mult * follow;
  const cap = (px: number, share: number) =>
    cellHeight && cellHeight > 0 ? Math.max(9, Math.min(px, Math.round(cellHeight * share))) : px;
  return {
    name: cap(Math.round(12 * k), 0.14),
    sub: cap(Math.round(10 * k), 0.11),
    ampm: cap(Math.round(14 * k), 0.12),
  };
}
