import { useDesigner } from '../state/store';

/**
 * 试戴预览切换：把圆环倾斜成戴在手腕上的视角，配合手腕剪影。
 */
export default function PreviewToggle() {
  const previewMode = useDesigner((s) => s.previewMode);
  const setPreview = useDesigner((s) => s.setPreview);

  return (
    <button
      onClick={() => setPreview(!previewMode)}
      className={`cap rounded-full pl-3 pr-3.5 py-2 flex items-center gap-1.5 text-[13px] font-medium active:scale-95 transition ${
        previewMode ? 'text-white !bg-ink/85' : 'text-ink'
      }`}
      title={previewMode ? '退出预览' : '试戴预览'}
    >
      <span className="text-base leading-none">{previewMode ? '↩' : '✋'}</span>
      {previewMode ? '退出试戴' : '试戴预览'}
    </button>
  );
}
