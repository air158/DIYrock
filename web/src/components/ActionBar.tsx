import { useDesigner } from '../state/store';

export default function ActionBar() {
  const clear  = useDesigner((s) => s.clear);
  const open   = useDesigner((s) => s.openPoster);
  const beads  = useDesigner((s) => s.beads);

  function save() {
    try {
      localStorage.setItem('zhu:beads', JSON.stringify(beads));
      // 用一个轻量提示
      const tag = document.createElement('div');
      tag.textContent = '已保存到本地';
      tag.className = 'fixed left-1/2 -translate-x-1/2 bottom-[16%] px-3 py-1.5 rounded-full bg-ink/85 text-white text-xs z-50';
      document.body.appendChild(tag);
      setTimeout(() => tag.remove(), 1400);
    } catch {/* ignore */}
  }

  return (
    <div className="flex items-stretch gap-2.5 p-3">
      <button
        onClick={clear}
        className="flex-1 h-11 rounded-2xl bg-white/85 text-ink2 text-[14px] font-medium border border-line active:scale-[0.98]"
      >
        清空
      </button>
      <button
        onClick={save}
        className="flex-1 h-11 rounded-2xl bg-white/85 text-ink text-[14px] font-medium border border-line active:scale-[0.98]"
      >
        保存
      </button>
      <button
        onClick={() => open(true)}
        disabled={beads.length === 0}
        className="flex-[1.4] h-11 rounded-2xl bg-accent text-white text-[14px] font-semibold disabled:opacity-50 active:scale-[0.98] shadow-card"
      >
        完成设计
      </button>
    </div>
  );
}
