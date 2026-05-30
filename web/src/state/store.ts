import { create } from 'zustand';
import { ALL_TYPES, findType, type BeadType } from '../data/catalog';

export interface BeadInstance {
  /** 唯一实例 id（用于动画 layoutId） */
  uid: string;
  /** 类型 id —— 指向 catalog */
  typeId: string;
}

export interface AIRecipe {
  intent: string;
  theme: string;
  copy: string;
  beads: { typeId: string; count: number; reason: string }[];
}

interface DesignerState {
  beads: BeadInstance[];
  /** 上次"添加来源"的卡片中心 px 偏移，用于入环动画起点 */
  spawnFrom: { x: number; y: number } | null;
  /** 当前选中的珠子实例 uid */
  selectedUid: string | null;
  /** AI 推荐结果 */
  recipe: AIRecipe | null;
  recipeLoading: boolean;
  /** 完成设计后翻面海报 */
  posterOpen: boolean;
  /** 最近一次拒绝添加的提示（手围超长时） */
  rejectAt: number;
  /** 试戴预览模式（圆环倾斜 + 手腕剪影） */
  previewMode: boolean;

  add: (typeId: string, fromPoint?: { x: number; y: number }) => boolean;
  remove: (uid: string) => void;
  clear: () => void;
  select: (uid: string | null) => void;
  setRecipe: (r: AIRecipe | null) => void;
  setRecipeLoading: (b: boolean) => void;
  applyRecipe: (r: AIRecipe) => void;
  openPoster: (b: boolean) => void;
  setPreview: (b: boolean) => void;
}

/** 手围（mm）硬上限：22.5cm = 225mm，对应大码男士手腕 */
export const MAX_WRIST_MM = 225;

let _uid = 0;
const newUid = () => `b_${Date.now().toString(36)}_${(_uid++).toString(36)}`;

const initial: BeadInstance[] = [
  // 默认开局：紫水晶 8mm × 12 颗 + 银隔片 ×2 给个有内容的初始视觉
  ...Array.from({ length: 12 }, () => ({ uid: newUid(), typeId: 'amethyst-10' })),
  { uid: newUid(), typeId: 'spacer-silver-3' },
  ...Array.from({ length: 2 }, () => ({ uid: newUid(), typeId: 'white-10' })),
  { uid: newUid(), typeId: 'spacer-silver-3' },
];

export const useDesigner = create<DesignerState>((set, get) => ({
  beads: initial,
  spawnFrom: null,
  selectedUid: null,
  recipe: null,
  recipeLoading: false,
  posterOpen: false,
  rejectAt: 0,
  previewMode: false,

  add: (typeId, fromPoint) => {
    const t = findType(typeId);
    if (!t) return false;
    const cur = get().beads.reduce((s, b) => s + (findType(b.typeId)?.size ?? 0), 0);
    if (cur + t.size > MAX_WRIST_MM) {
      set({ rejectAt: Date.now() });
      return false;
    }
    set((s) => ({
      beads: [...s.beads, { uid: newUid(), typeId }],
      spawnFrom: fromPoint ?? null,
    }));
    return true;
  },
  remove: (uid) => set((s) => ({ beads: s.beads.filter((b) => b.uid !== uid), selectedUid: null })),
  clear: () => set({ beads: [], selectedUid: null, recipe: null }),
  select: (uid) => set({ selectedUid: uid }),
  setRecipe: (r) => set({ recipe: r }),
  setRecipeLoading: (b) => set({ recipeLoading: b }),
  applyRecipe: (r) =>
    set(() => {
      const next: BeadInstance[] = [];
      let total = 0;
      for (const item of r.beads) {
        const t = findType(item.typeId);
        if (!t) continue;
        for (let i = 0; i < item.count; i++) {
          if (total + t.size > MAX_WRIST_MM) break;
          next.push({ uid: newUid(), typeId: item.typeId });
          total += t.size;
        }
      }
      return { beads: next, recipe: r, selectedUid: null };
    }),
  openPoster: (b) => set({ posterOpen: b }),
  setPreview: (b) => set({ previewMode: b }),
}));

/** 派生：对应类型快照（顺序与 beads 一致）—— 不要直接做 store selector，调用方需用 useMemo */
export function deriveBeadTypes(beads: BeadInstance[]): BeadType[] {
  return beads.map((b) => findType(b.typeId)!).filter(Boolean) as BeadType[];
}

export function deriveTotalPrice(beads: BeadInstance[]): number {
  return beads.reduce((s, b) => {
    const t = findType(b.typeId);
    return s + (t?.price ?? 0);
  }, 0);
}

export function deriveDominantType(beads: BeadInstance[]): BeadType | null {
  const counts = new Map<string, number>();
  for (const b of beads) {
    const t = findType(b.typeId);
    if (!t || t.kind !== 'crystal') continue;
    counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
  }
  if (counts.size === 0) return ALL_TYPES.find((t) => t.kind === 'crystal') ?? null;
  let best = '', bestN = 0;
  counts.forEach((n, id) => { if (n > bestN) { bestN = n; best = id; } });
  return findType(best) ?? null;
}
