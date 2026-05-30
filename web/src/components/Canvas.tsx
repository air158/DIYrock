import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Bead from './Bead';
import { layoutRing } from '../lib/ringLayout';
import { deriveBeadTypes, deriveDominantType, useDesigner } from '../state/store';
import { findType } from '../data/catalog';

/**
 * 中央画布：把珠子按 ringLayout 派生位置绝对定位，
 * 并通过 layoutId 让 Framer Motion 自动做 FLIP 重排。
 */
export default function Canvas() {
  const beads = useDesigner((s) => s.beads);
  const remove = useDesigner((s) => s.remove);
  const select = useDesigner((s) => s.select);
  const selectedUid = useDesigner((s) => s.selectedUid);
  const previewMode = useDesigner((s) => s.previewMode);
  const types = useMemo(() => deriveBeadTypes(beads), [beads]);
  const dom = useMemo(() => deriveDominantType(beads), [beads]);

  // 测量画布尺寸（响应式）
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 360, h: 360 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const minSide = Math.min(size.w, size.h);

  // 物理常数：1mm 在画布上恒等于多少 px。
  // 珠子永远保持真实尺寸（8/10/12mm 比例固定），珠子越多 → 圆环越大，
  // 而不是反过来缩小珠子。
  // 这里取 minSide / 64 作为基准，即 8mm 珠子 ≈ minSide/8。
  const mmToPx = minSide / 64;

  const layout = useMemo(
    () => layoutRing(types, { mmToPx }),
    [types, mmToPx],
  );

  // 主导色作为光晕
  const haloColor = dom?.body ?? '#a073d8';

  return (
    <div
      ref={ref}
      className="relative w-full h-full flex items-center justify-center select-none"
      style={{ perspective: 900 }}
    >
      {/* 中央 logo / 背景光晕 */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        animate={{
          width: minSide * (previewMode ? 0.78 : 0.62),
          height: minSide * (previewMode ? 0.36 : 0.62),
          opacity: previewMode ? 0.5 : 1,
        }}
        style={{
          background: `radial-gradient(circle, ${haloColor}30 0%, transparent 65%)`,
          filter: 'blur(8px)',
        }}
        transition={{ duration: 0.6 }}
      />

      {/* 手腕剪影：仅预览模式可见 */}
      <AnimatePresence>
        {previewMode && <WristSilhouette size={minSide} color={haloColor} />}
      </AnimatePresence>

      {/* 中央 logo：水晶能量符（预览模式隐藏） */}
      <AnimatePresence>
        {!previewMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-none flex flex-col items-center justify-center text-center"
            style={{
              width: minSide * 0.36,
              height: minSide * 0.36,
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                border: `1px dashed ${haloColor}55`,
                borderRadius: '50%',
              }}
            />
            <div className="text-[11px] tracking-[0.4em] text-ink2">CRYSTAL</div>
            <div
              className="font-medium tabular my-1"
              style={{ fontSize: minSide * 0.05, color: haloColor }}
            >
              今日水晶
            </div>
            <div className="text-[10px] tracking-[0.3em] text-ink2">能量搭子</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 整环容器：预览模式倾斜成手腕角度，并暂停自转 */}
      <motion.div
        className="absolute"
        style={{
          width: 0,
          height: 0,
          left: '50%',
          top: '50%',
          transformStyle: 'preserve-3d',
        }}
        animate={previewMode
          ? { rotateX: 70, rotateZ: 0, rotate: 0 }
          : { rotateX: 0,  rotateZ: 0, rotate: 360 }}
        transition={previewMode
          ? { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          : { rotate: { duration: 240, repeat: Infinity, ease: 'linear' } }}
      >
        <AnimatePresence>
          {beads.map((b, i) => {
            const placed = layout.beads[i];
            const t = findType(b.typeId);
            if (!t || !placed) return null;
            const isSel = selectedUid === b.uid;
            // 预览模式：把"角度的 sin"作为深度排序权重，前珠在前后珠在后
            const depthZ = previewMode ? Math.sin(placed.angle) * 30 : 0;
            return (
              <motion.div
                key={b.uid}
                layout
                layoutId={b.uid}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{
                  scale: 1, opacity: 1,
                  x: placed.x, y: placed.y,
                }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                style={{
                  position: 'absolute',
                  left: -placed.d / 2,
                  top:  -placed.d / 2,
                  width: placed.d, height: placed.d,
                  zIndex: isSel ? 5 : 1,
                  transform: `translateZ(${depthZ}px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <Bead
                  type={t}
                  diameter={placed.d}
                  selected={isSel}
                  highlightAngleRad={-placed.angle - Math.PI / 2}
                  metallic={t.kind === 'accessory'}
                  onClick={() => {
                    if (selectedUid === b.uid) remove(b.uid);
                    else select(b.uid);
                  }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* 选中提示 */}
      <AnimatePresence>
        {selectedUid && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-ink/90 text-white text-xs"
          >
            再点一次删除 · 点其他空白处取消
          </motion.div>
        )}
      </AnimatePresence>

      {/* 预览模式角标 */}
      <AnimatePresence>
        {previewMode && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-ink/85 text-white text-[11px] tracking-wider pointer-events-none"
          >
            试戴预览
          </motion.div>
        )}
      </AnimatePresence>

      {/* 点击空白取消选择 */}
      <button
        aria-label="cancel"
        className="absolute inset-0 -z-10"
        onClick={() => select(null)}
      />
    </div>
  );
}

/**
 * 手部插画：SVG 绘制一只手，手腕在画布中心（圆环倾斜后正好套在手腕上），
 * 手掌+手指向上伸出（在圆环之上），手臂从下方进入画面。
 * 全部矢量，零素材依赖；颜色用暖米色调与背景相协。
 */
function WristSilhouette({ size }: { size: number; color: string }) {
  const w = size * 0.92;
  const h = size * 1.35; // 比画布高，让手臂自然延伸出底部

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      className="absolute pointer-events-none"
      style={{
        width: w,
        height: h,
        // 让"手腕"位置（SVG 中 y≈220）落到画布中心
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -42%)',
        zIndex: 0,
        filter: 'drop-shadow(0 18px 24px rgba(80, 40, 10, 0.18))',
      }}
    >
      <svg viewBox="0 0 240 360" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="skin-main" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#fce4ce" />
            <stop offset="55%"  stopColor="#f1c8a8" />
            <stop offset="100%" stopColor="#d8a684" />
          </linearGradient>
          <linearGradient id="skin-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#b88563" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#000"    stopOpacity="0" />
            <stop offset="100%" stopColor="#b88563" stopOpacity="0.55" />
          </linearGradient>
          <radialGradient id="palm-shade" cx="50%" cy="60%" r="55%">
            <stop offset="0%"  stopColor="#a86842" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a86842" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 手掌 + 拇指 + 四指（一根 path 描出整体轮廓）。
            坐标系约定：x 0-240，y 0-360，y 较小靠上。
            手腕在 y≈210-235，手掌核心在 y≈100-210，
            食指/中指/无名指/小指从 y≈100 向上延伸到 y≈10-30，
            拇指在左侧从 y≈170 伸到 y≈70 */}
        <path
          d="
            M 80 360
            L 80 240
            Q 80 220 78 210
            Q 60 190 56 165
            Q 50 130 60 110
            Q 70 95 78 90
            L 70 50
            Q 65 18 80 12
            Q 95 8 100 38
            L 105 90
            L 108 90
            L 108 30
            Q 108 4 122 4
            Q 136 4 136 30
            L 136 90
            L 140 90
            L 140 38
            Q 140 12 154 12
            Q 168 12 168 38
            L 165 95
            L 168 95
            L 175 60
            Q 180 38 192 40
            Q 204 44 198 70
            L 188 120
            Q 188 160 182 195
            Q 178 220 170 240
            L 170 360
            Z
          "
          fill="url(#skin-main)"
          stroke="#a06d4a"
          strokeWidth="1.2"
          strokeOpacity="0.35"
        />

        {/* 边缘暗化（让手有立体感） */}
        <path
          d="
            M 80 360
            L 80 240
            Q 80 220 78 210
            Q 60 190 56 165
            Q 50 130 60 110
            Q 70 95 78 90
            L 70 50
            Q 65 18 80 12
            Q 95 8 100 38
            L 105 90
            L 108 90
            L 108 30
            Q 108 4 122 4
            Q 136 4 136 30
            L 136 90
            L 140 90
            L 140 38
            Q 140 12 154 12
            Q 168 12 168 38
            L 165 95
            L 168 95
            L 175 60
            Q 180 38 192 40
            Q 204 44 198 70
            L 188 120
            Q 188 160 182 195
            Q 178 220 170 240
            L 170 360
            Z
          "
          fill="url(#skin-side)"
        />

        {/* 掌心阴影 */}
        <ellipse cx="120" cy="160" rx="46" ry="40" fill="url(#palm-shade)" />

        {/* 指节高光（让手指有结构） */}
        <g opacity="0.45">
          <ellipse cx="84"  cy="60"  rx="6"  ry="3" fill="#fff7e6" />
          <ellipse cx="120" cy="38"  rx="7"  ry="3" fill="#fff7e6" />
          <ellipse cx="153" cy="46"  rx="6"  ry="3" fill="#fff7e6" />
          <ellipse cx="184" cy="76"  rx="5"  ry="2.5" fill="#fff7e6" />
        </g>

        {/* 手腕处一道柔和的横向暗带，圆环戴上去后正好压在这里 */}
        <ellipse cx="125" cy="232" rx="52" ry="6" fill="#a86842" opacity="0.18" />
      </svg>
    </motion.div>
  );
}
