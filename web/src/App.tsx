import { useEffect, useMemo } from 'react';
import Canvas from './components/Canvas';
import StatusBar from './components/StatusBar';
import Drawer from './components/Drawer';
import ActionBar from './components/ActionBar';
import AIPanel from './components/AIPanel';
import PosterModal from './components/PosterModal';
import MeaningCard from './components/MeaningCard';
import Splash from './components/Splash';
import PreviewToggle from './components/PreviewToggle';
import { deriveDominantType, useDesigner } from './state/store';

export default function App() {
  const beads = useDesigner((s) => s.beads);
  const dom = useMemo(() => deriveDominantType(beads), [beads]);

  // 主题色随主导水晶切换：背景 hue / s / l 走 CSS 变量
  useEffect(() => {
    const r = document.documentElement.style;
    const hue = dom?.themeHue ?? 270;
    r.setProperty('--bg-h', String(hue));
    r.setProperty('--bg-s', '70%');
    r.setProperty('--bg-l', '96%');
    document.body.style.background = `hsl(${hue} 70% 96%)`;
  }, [dom?.themeHue]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景层（呼吸渐变） */}
      <div className="app-bg" />

      {/* 顶部状态栏 + AI 入口 */}
      <div className="absolute inset-x-0 top-0 z-20 pt-[max(env(safe-area-inset-top),12px)]">
        <div className="px-4 flex items-start gap-2">
          <div className="flex-1">
            <StatusBar />
          </div>
        </div>
        <div className="mt-2 px-4 flex items-center gap-2">
          <AIPanel />
          <PreviewToggle />
          <div className="flex-1" />
          <MeaningCard />
        </div>
      </div>

      {/* 中央画布 */}
      <div className="absolute inset-0 z-10 flex flex-col pt-[110px] pb-[388px]">
        <Canvas />
      </div>

      {/* 抽屉（底部约 360px） + 动作 */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <Drawer />
        <div className="glass border-t border-line/60">
          <ActionBar />
          <div className="h-[max(env(safe-area-inset-bottom),0px)]" />
        </div>
      </div>

      <PosterModal />
      <Splash />
    </div>
  );
}
