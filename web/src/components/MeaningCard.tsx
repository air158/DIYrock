import { motion, AnimatePresence } from 'framer-motion';
import { findType } from '../data/catalog';
import { useDesigner } from '../state/store';

const MEANING_FALLBACK: Record<string, string> = {
  white: '净化磁场 · 提升专注，开运基石。',
  amethyst: '安抚情绪 · 平静思绪，提升直觉。',
  citrine: '招财聚气 · 提升信心，温暖能量。',
  rose: '柔化关系 · 招桃花，温柔自爱。',
  green: '事业稳进 · 招正财，扎根成长。',
  obsidian: '辟邪挡煞 · 化解负能，护身常带。',
};

/**
 * 选中珠子时浮现的"寓意小卡"，给用户即时价值感。
 */
export default function MeaningCard() {
  const uid = useDesigner((s) => s.selectedUid);
  const beads = useDesigner((s) => s.beads);
  const item = beads.find((b) => b.uid === uid);
  const t = item ? findType(item.typeId) : null;
  const same = item ? beads.filter((b) => b.typeId === item.typeId).length : 0;

  const meaning = t?.meaning ?? (t ? MEANING_FALLBACK[t.id.split('-')[0]] : '') ?? '';

  return (
    <AnimatePresence>
      {t && (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="cap rounded-2xl px-3.5 py-2.5 max-w-[260px] flex items-start gap-2.5"
        >
          <div
            className="w-7 h-7 rounded-full shrink-0 mt-0.5"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${t.highlight} 0%, ${t.body} 60%, ${t.shadow} 100%)`,
              border: `0.5px solid ${t.rim}`,
            }}
          />
          <div className="leading-tight">
            <div className="text-[13px] font-medium text-ink">{t.name} · {t.size}mm <span className="text-ink2 font-normal">×{same}</span></div>
            <div className="text-[12px] text-ink2 mt-0.5">{meaning}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
