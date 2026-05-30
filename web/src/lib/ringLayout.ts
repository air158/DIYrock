// 圆环布局引擎：纯函数派生坐标
// 输入: 珠子直径数组（mm）以及画布缩放比 mmToPx
// 输出: 每颗珠子的 (x, y) 圆心位置（px，画布坐标系，0 在画布中心）
//
// 模型:
//   C = Σ(直径_i)               -> 周长（mm）= 手围
//   R = C / (2π)                  -> 半径（mm）
//   θ_i = (直径_i / C) × 2π       -> 占角
//   累加角度，置中：从 -π/2 起步（顶部）

import type { BeadType } from '../data/catalog';

export interface PlacedBead {
  /** 圆心 x（px） */
  x: number;
  /** 圆心 y（px） */
  y: number;
  /** 渲染直径（px） */
  d: number;
  /** 在数组中的索引 */
  index: number;
  /** 此珠子占用的圆心角（rad） */
  theta: number;
  /** 此珠子相对画布中心的角度（rad）— 用于旋转修饰 */
  angle: number;
}

export interface RingLayout {
  beads: PlacedBead[];
  /** 周长（mm） */
  circumferenceMm: number;
  /** 半径（mm） */
  radiusMm: number;
  /** 渲染半径（px） */
  radiusPx: number;
  /** 画布中央到最远边缘需要预留的尺寸（px） */
  outerR: number;
}

export interface LayoutOptions {
  /** 1mm 在画布上等于多少 px */
  mmToPx: number;
  /** 画布最大允许的渲染半径（px），超出会自动缩放 mmToPx */
  maxRadiusPx?: number;
  /** 起始角（rad），默认顶部 -π/2 */
  startAngle?: number;
  /** 当珠子总数过少时（首尾不接），用一个最小默认半径让画布看起来不空 */
  minRadiusPx?: number;
}

/**
 * 计算圆环上每颗珠子的几何位置。
 * 当珠子数量为 0 或 1 时给出友好回退（绘制单珠预览）。
 */
export function layoutRing(types: BeadType[], opts: LayoutOptions): RingLayout {
  const startAngle = opts.startAngle ?? -Math.PI / 2;
  const mmToPx = opts.mmToPx;

  const C = types.reduce((s, t) => s + t.size, 0); // mm
  const R_mm = C > 0 ? C / (2 * Math.PI) : 0;

  // 注意：这里不再因为超限而反向缩小 mmToPx —— 珠子的物理尺寸必须恒定。
  // 当圆环过大时只允许其超出画布（顶部"长度过长"会提示用户），
  // 缩比只在调用方主动调整 mmToPx 时发生。
  let R_px = R_mm * mmToPx;
  if (opts.maxRadiusPx && R_px > opts.maxRadiusPx) {
    R_px = opts.maxRadiusPx;
  }
  if (opts.minRadiusPx && R_px < opts.minRadiusPx) {
    R_px = opts.minRadiusPx;
  }

  const placed: PlacedBead[] = [];
  let acc = startAngle;
  let outerR = 0;

  if (types.length === 0) {
    return {
      beads: [], circumferenceMm: 0, radiusMm: 0, radiusPx: 0, outerR: 0,
    };
  }

  if (types.length === 1) {
    const d = types[0].size * mmToPx;
    placed.push({ x: 0, y: 0, d, index: 0, theta: Math.PI * 2, angle: 0 });
    outerR = d / 2;
    return { beads: placed, circumferenceMm: C, radiusMm: R_mm, radiusPx: 0, outerR };
  }

  for (let i = 0; i < types.length; i++) {
    const t = types[i];
    const theta = (t.size / C) * 2 * Math.PI;
    // 把珠子的"中心"放在它占角的中点：θ_center = acc + θ/2
    const angle = acc + theta / 2;
    const x = R_px * Math.cos(angle);
    const y = R_px * Math.sin(angle);
    const d = t.size * mmToPx;
    placed.push({ x, y, d, index: i, theta, angle });
    outerR = Math.max(outerR, R_px + d / 2);
    acc += theta;
  }

  return { beads: placed, circumferenceMm: C, radiusMm: R_mm, radiusPx: R_px, outerR };
}

/** 估算合适的画布像素到 mm 缩放,使珠串看起来不会撑爆容器 */
export function recommendScale(canvasSize: number, beadCountHint = 16): number {
  // 默认按 ~16 颗 10mm 珠子的圆环占 80% 容器
  const C = beadCountHint * 10;
  const R = C / (2 * Math.PI); // mm
  return (canvasSize * 0.4) / Math.max(R, 1);
}
