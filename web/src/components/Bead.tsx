import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import type { BeadType } from '../data/catalog';

interface Props {
  type: BeadType;
  diameter: number;          // px 渲染直径
  selected?: boolean;
  /** 高光相对位置 0-1（用于全环统一光源） */
  highlightAngleRad?: number;
  onClick?: () => void;
  className?: string;
  /** 强度（用于配饰金属质感）—— 仅影响表面 spec */
  metallic?: boolean;
  style?: CSSProperties;
  /** 是否作为可交互按钮渲染。在已经处于 button 内时设为 false 以避免嵌套。 */
  interactive?: boolean;
}

/**
 * 用 CSS radial-gradient 程序化渲染一颗水晶/配饰珠子。
 * - 球体感：主色径向 + 边缘暗化
 * - 高光：固定光源方向（左上）
 * - 投影：drop-shadow
 * 整颗珠子是一个圆形 div，中心 = 元素中心；外层 transform: translate 来定位。
 */
export default function Bead({
  type, diameter, selected, highlightAngleRad = -Math.PI * 0.75,
  onClick, className = '', metallic, style, interactive = true,
}: Props) {
  const r = diameter / 2;
  // 高光方向（默认指向左上）
  const hx = 50 + Math.cos(highlightAngleRad) * 22;
  const hy = 50 + Math.sin(highlightAngleRad) * 22;

  // 主球体渐变：高光点偏白 -> body -> 边缘暗化
  const main = `radial-gradient(circle at ${hx}% ${hy}%,
    ${type.highlight} 0%,
    ${type.highlight} 6%,
    ${type.body} 40%,
    ${type.shadow} 92%,
    ${type.shadow} 100%)`;

  // 第二层小高光（更亮的点）
  const hl = `radial-gradient(circle at ${hx}% ${hy}%,
    rgba(255,255,255,0.9) 0%,
    rgba(255,255,255,0) 12%)`;

  // 第三层环境反射（底部反光）
  const ambient = `radial-gradient(circle at 50% 110%,
    ${type.rim}55 0%, transparent 35%)`;

  const Tag = interactive ? motion.button : motion.div;
  const extraProps = interactive
    ? { type: 'button' as const, onClick, whileTap: { scale: 0.92 } }
    : {};

  return (
    <Tag
      {...extraProps}
      className={`relative rounded-full ${className}`}
      style={{
        width: diameter,
        height: diameter,
        background: `${hl}, ${ambient}, ${main}`,
        boxShadow: selected
          ? `0 0 0 ${Math.max(2, r * 0.18)}px ${type.body}33,
             0 ${r * 0.25}px ${r * 0.5}px ${type.shadow}55,
             inset 0 -${r * 0.12}px ${r * 0.18}px ${type.shadow}66`
          : `0 ${r * 0.25}px ${r * 0.5}px ${type.shadow}44,
             inset 0 -${r * 0.12}px ${r * 0.18}px ${type.shadow}55`,
        border: `0.5px solid ${type.rim}`,
        cursor: interactive ? 'pointer' : 'default',
        padding: 0,
        outline: 'none',
        ...style,
      }}
      title={`${type.name} ${type.size}mm`}
    >
      {/* 镜面高光（靠近顶部的椭圆白光） */}
      <span
        aria-hidden
        className="pointer-events-none absolute rounded-full"
        style={{
          width: diameter * 0.52,
          height: diameter * 0.28,
          left: '14%',
          top: '10%',
          background:
            'radial-gradient(50% 100% at 50% 50%, rgba(255,255,255,0.85), rgba(255,255,255,0) 70%)',
          filter: 'blur(0.6px)',
          transform: 'rotate(-22deg)',
          opacity: metallic ? 0.55 : 0.85,
        }}
      />
    </Tag>
  );
}
