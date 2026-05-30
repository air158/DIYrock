import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { deriveBeadTypes, deriveDominantType, deriveTotalPrice, useDesigner } from '../state/store';

export default function PosterModal() {
  const open = useDesigner((s) => s.posterOpen);
  const close = () => useDesigner.getState().openPoster(false);
  const recipe = useDesigner((s) => s.recipe);
  const beads = useDesigner((s) => s.beads);
  const types = useMemo(() => deriveBeadTypes(beads), [beads]);
  const dom = useMemo(() => deriveDominantType(beads), [beads]);
  const price = useMemo(() => deriveTotalPrice(beads), [beads]);

  const cm = types.reduce((s, t) => s + t.size, 0) / 10;
  const haloColor = dom?.body ?? '#a073d8';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative w-[300px] aspect-[3/4] rounded-[28px] overflow-hidden shadow-2xl"
            style={{
              background: `radial-gradient(120% 80% at 50% 0%, ${haloColor}55, transparent 60%),
                           linear-gradient(180deg, #1b1530 0%, #0c0a18 100%)`,
              color: 'white',
            }}
          >
            <div className="absolute inset-x-0 top-0 p-5">
              <div className="text-[10px] tracking-[0.4em] opacity-80">CRYSTAL HEALING</div>
              <div className="mt-1 text-2xl font-semibold">{recipe?.theme ?? '今日水晶'}</div>
              <div className="mt-2 text-[12px] leading-relaxed opacity-85">{recipe?.copy ?? '愿这一圈光，托住你今天的小心愿。'}</div>
            </div>

            {/* 中心光环 + 字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="w-[200px] h-[200px] rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, ${haloColor}99, transparent, ${haloColor}99)`,
                  filter: 'blur(14px)',
                  opacity: 0.6,
                }}
              />
              <div className="absolute text-center">
                <div className="text-[11px] tracking-[0.4em] opacity-80">{dom?.name ?? '紫水晶'}</div>
                <div className="text-3xl font-semibold tabular mt-1">{cm.toFixed(1)}<span className="text-base ml-1">cm</span></div>
                <div className="text-[12px] opacity-80 mt-1">¥{price}</div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.3em] opacity-70">能量搭子 · 今日水晶</div>
                  <div className="text-[11px] mt-1 opacity-85">扫码刷到 · 即来即用</div>
                </div>
                {/* mock 二维码 */}
                <div className="w-14 h-14 rounded-md bg-white p-1.5">
                  <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-[1px]">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={(i * 7 + 13) % 3 === 0 ? 'bg-black' : 'bg-white'} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white/80 text-base"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
