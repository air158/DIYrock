import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Bead from './Bead';
import { layoutRing } from '../lib/ringLayout';
import { deriveBeadTypes, deriveDominantType, useDesigner } from '../state/store';
import { findType } from '../data/catalog';

// 3D 手部模型按需加载（first paint 不带 three.js）
const Hand3D = lazy(() => import('./Hand3D'));

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

      {/* 3D 手部模型：仅预览模式显示（按需加载） */}
      {previewMode && (
        <Suspense fallback={null}>
          <Hand3D size={minSide} visible={previewMode} />
        </Suspense>
      )}

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
