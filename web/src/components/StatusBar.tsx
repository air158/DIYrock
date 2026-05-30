import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import CountUp from './CountUp';
import { deriveBeadTypes, deriveTotalPrice, useDesigner } from '../state/store';

const MIN_CM = 13.5;
const MAX_CM = 22.0;

export default function StatusBar() {
  const beads = useDesigner((s) => s.beads);
  const types = useMemo(() => deriveBeadTypes(beads), [beads]);
  const price = useMemo(() => deriveTotalPrice(beads), [beads]);

  const cm = useMemo(() => {
    const C = types.reduce((s, t) => s + t.size, 0);
    return C / 10;
  }, [types]);

  let status: 'short' | 'long' | 'ok' = 'ok';
  if (cm > 0 && cm < MIN_CM) status = 'short';
  else if (cm > MAX_CM) status = 'long';

  const tip =
    status === 'short' ? '长度过短，再加几颗' :
    status === 'long'  ? '长度过长，可以减一些' : '尺寸合适';

  return (
    <div className="w-full flex justify-center pointer-events-none">
      <div className="cap rounded-full px-4 py-2 flex items-center gap-3 pointer-events-auto">
        {/* 手围 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink2">手围</span>
          <motion.span
            key={status}
            animate={status !== 'ok'
              ? { color: ['#2a2240', '#ff5470', '#2a2240'] }
              : { color: '#2a2240' }}
            transition={{ duration: 0.6, times: [0, 0.5, 1] }}
            className="font-semibold text-[15px]"
          >
            <CountUp value={cm} decimals={1} suffix=" cm" />
          </motion.span>
        </div>
        <span className="w-px h-4 bg-line" />
        {/* 总价 */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-ink2">总价</span>
          <span className="font-semibold text-[15px] text-ink">
            <CountUp value={price} decimals={0} prefix="¥ " />
          </span>
        </div>

        {/* 校验提示（只在异常时显示） */}
        <AnimatePresence>
          {status !== 'ok' && (
            <motion.span
              key="tip"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className={`text-[11px] px-2 py-0.5 rounded-full ${
                status === 'short' ? 'bg-warn/15 text-warn' : 'bg-amber-100 text-amber-600'
              }`}
            >
              {tip}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
