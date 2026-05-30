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
    >
      {/* 中央 logo / 背景光晕 */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: minSide * 0.62,
          height: minSide * 0.62,
          background: `radial-gradient(circle, ${haloColor}30 0%, transparent 65%)`,
          filter: 'blur(8px)',
        }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 中央 logo：水晶能量符 */}
      <div
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
      </div>

      {/* 整环旋转容器（极缓自转） */}
      <motion.div
        className="absolute"
        style={{ width: 0, height: 0, left: '50%', top: '50%' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 240, repeat: Infinity, ease: 'linear' }}
      >
        <AnimatePresence>
          {beads.map((b, i) => {
            const placed = layout.beads[i];
            const t = findType(b.typeId);
            if (!t || !placed) return null;
            const isSel = selectedUid === b.uid;
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

      {/* 点击空白取消选择 */}
      <button
        aria-label="cancel"
        className="absolute inset-0 -z-10"
        onClick={() => select(null)}
      />
    </div>
  );
}
