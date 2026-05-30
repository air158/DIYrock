import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Bead from './Bead';
import { CATEGORIES, typesByCategory, type BeadKind } from '../data/catalog';
import { useDesigner } from '../state/store';

export default function Drawer() {
  const [tab, setTab] = useState<BeadKind>('crystal');
  const cats = useMemo(() => CATEGORIES.filter((c) => c.kind === tab), [tab]);
  const [catId, setCatId] = useState(cats[0]?.id ?? 'amethyst');
  // tab 切换时重置分类（用 effect 避免 render 期 setState）
  useEffect(() => { setCatId(cats[0]?.id ?? ''); }, [tab, cats]);

  const list = useMemo(() => typesByCategory(catId), [catId]);
  const add = useDesigner((s) => s.add);

  return (
    <div className="glass rounded-t-3xl border-t border-white/60 shadow-card flex flex-col"
         style={{ height: 320 }}>
      {/* drag handle */}
      <div className="pt-2 pb-1 flex items-center justify-center">
        <div className="w-10 h-1 rounded-full bg-ink2/30" />
      </div>

      {/* Tabs */}
      <div className="px-4 flex items-center gap-1">
        {(['crystal', 'accessory'] as BeadKind[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`relative px-3 py-1.5 text-[14px] font-medium ${
              tab === k ? 'text-ink' : 'text-ink2'
            }`}
          >
            {k === 'crystal' ? '珠子' : '配饰'}
            {tab === k && (
              <motion.div
                layoutId="tab-underline"
                className="absolute left-2 right-2 -bottom-0.5 h-[2px] rounded-full bg-accent"
              />
            )}
          </button>
        ))}
        <div className="ml-auto text-[11px] text-ink2">点击卡片 → 入环</div>
      </div>
      <div className="h-px bg-line/70 mx-4 mt-1" />

      <div className="flex-1 flex min-h-0">
        {/* 左：分类竖排 */}
        <div className="w-[88px] py-2 border-r border-line/70 overflow-y-auto no-scrollbar">
          {cats.map((c) => {
            const active = c.id === catId;
            return (
              <button
                key={c.id}
                onClick={() => setCatId(c.id)}
                className={`relative w-full px-2 py-3 text-[13px] text-left ${
                  active ? 'text-ink font-medium bg-white/60' : 'text-ink2'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-accent" />
                )}
                <span className="pl-2">{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* 右：卡片网格 */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-3 content-start">
          {list.map((t) => (
            <button
              key={t.id}
              onClick={(e) => {
                const r = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
                add(t.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
              }}
              className="relative bg-white/85 rounded-2xl p-2.5 shadow-soft hover:shadow-card transition active:scale-[0.97]"
            >
              <div className="aspect-square w-full flex items-center justify-center">
                <Bead type={t} diameter={Math.min(64, 28 + t.size * 3.2)} metallic={t.kind === 'accessory'} interactive={false} />
              </div>
              <div className="mt-1 text-[12px] font-medium text-ink leading-tight">{t.name}</div>
              <div className="text-[10.5px] text-ink2 flex justify-between mt-0.5">
                <span>{t.size}mm</span>
                <span className="font-medium text-accent">¥{t.price}</span>
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <div className="col-span-3 py-8 text-center text-ink2 text-sm">暂无可选</div>
          )}
        </div>
      </div>
    </div>
  );
}
