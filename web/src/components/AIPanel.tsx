import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesigner } from '../state/store';
import { recommendRecipe, QUICK_PROMPTS } from '../ai/recipe';

export default function AIPanel() {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState('');
  const recipe = useDesigner((s) => s.recipe);
  const loading = useDesigner((s) => s.recipeLoading);
  const setRecipe = useDesigner((s) => s.setRecipe);
  const setLoading = useDesigner((s) => s.setRecipeLoading);
  const apply = useDesigner((s) => s.applyRecipe);

  async function go(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setOpen(true);
    try {
      const r = await recommendRecipe(text.trim());
      setRecipe(r);
      apply(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* 浮动入口按钮 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="cap rounded-full pl-3 pr-3.5 py-2 flex items-center gap-1.5 text-[13px] font-medium text-ink active:scale-95 transition"
      >
        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-fuchsia-400 to-amber-300 flex items-center justify-center text-white text-[11px]">✨</span>
        AI 配方
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/30"
            onClick={() => setOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              className="w-full sm:w-[420px] glass rounded-t-3xl sm:rounded-3xl p-4 m-0 sm:m-4 shadow-card relative overflow-hidden"
            >
              {loading && <div className="absolute inset-0 shimmer pointer-events-none" />}
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-fuchsia-400 to-amber-300 flex items-center justify-center text-white text-sm">✨</span>
                <div className="font-semibold text-ink">告诉我此刻的状态</div>
                <button onClick={() => setOpen(false)} className="ml-auto text-ink2 text-sm">收起</button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    disabled={loading}
                    onClick={() => go(p)}
                    className="px-2.5 py-1 rounded-full bg-white/80 border border-line text-[12px] text-ink2 hover:text-ink active:scale-95"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') go(intent); }}
                  placeholder="或自由输入：例如「今天想温柔一点」"
                  className="flex-1 rounded-full bg-white/85 border border-line px-3.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
                />
                <button
                  disabled={loading}
                  onClick={() => go(intent)}
                  className="rounded-full px-3.5 py-2 text-[13px] font-medium text-white bg-accent disabled:opacity-50 active:scale-95"
                >
                  {loading ? '配方中…' : '生成'}
                </button>
              </div>

              <AnimatePresence>
                {recipe && !loading && (
                  <motion.div
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 rounded-2xl bg-white/85 p-3.5 border border-line"
                  >
                    <div className="text-[11px] tracking-widest text-ink2">主题</div>
                    <div className="text-base font-semibold text-ink">{recipe.theme}</div>
                    <div className="text-[13px] text-ink2 mt-1 leading-relaxed">{recipe.copy}</div>
                    <div className="mt-3 grid grid-cols-1 gap-1.5">
                      {recipe.beads.map((b, i) => (
                        <div key={i} className="flex items-center justify-between text-[12px] text-ink2">
                          <span className="text-ink">· {b.reason}</span>
                          <span className="tabular">{b.typeId} ×{b.count}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
