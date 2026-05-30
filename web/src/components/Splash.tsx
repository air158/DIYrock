import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * 首屏开场：模拟从抖音信息流上滑进入。
 * 1.5s 后自动消失，强化「刷到即用」的赛道三定位。
 */
export default function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.7, ease: [0.5, 0, 0, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 30%, #d3bcff, transparent 70%), linear-gradient(180deg, #faf6ff 0%, #f4eeff 100%)',
          }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.05 }}
              className="mx-auto w-32 h-32 rounded-full relative"
              style={{
                background: `radial-gradient(circle at 30% 30%, #ffffff 0%, #c8a4ff 50%, #5b3a9a 100%)`,
                boxShadow: '0 30px 60px -20px rgba(120, 60, 200, 0.5)',
              }}
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full"
                style={{ border: '1px dashed rgba(120,60,200,0.4)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 text-[10px] tracking-[0.45em] text-ink2"
            >
              CRYSTAL HEALING
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-1.5 text-2xl font-semibold text-ink"
            >
              今日水晶 · 能量搭子
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-1.5 text-[12px] text-ink2"
            >
              刷到即用 · 一圈光的小心愿
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
