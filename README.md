# 今日水晶 · 能量搭子

水晶手串 DIY 设计器，刷到即用。抖音 AI 创变者计划 2026 · 黑客松联赛 温州站参赛作品。

> 主攻赛道三「AI 体验：刷到懂你的瞬间」，兼容赛道二「内容重构」（视频 → 配方复刻）。

## 一句话产品

输入此刻状态（"压力大想要平静" / "出差希望平安"），AI 给出一串水晶配方，珠子自动入环、半径生长、手围与总价实时跳动，圆环可继续自由增删，30 秒做出今天独一份的能量手串。

## 技术架构

```
React 19 + TS + Vite 8        — 极简工程
Zustand                        — 单一数据源 (beads: BeadInstance[])
Framer Motion                  — layout/spring/exit 一把梭
Tailwind v3 + CSS 变量         — 主题色随主导水晶切换
绝对定位 div + transform        — 取代 Canvas，易动画易点击
CSS radial-gradient            — 程序化渲染水晶球，零素材
OpenAI 兼容 chat/completions  — 意图→结构化 JSON 配方（可回退本地 mock）
```

## 核心：圆环布局引擎

`src/lib/ringLayout.ts`

```
C   = Σ(直径_i)             // 周长(mm) = 手围
R   = C / (2π)              // 半径
θ_i = (直径_i / C) × 2π     // 各珠占角
x   = R·cos(累加角)         // 圆心坐标
y   = R·sin(累加角)
```

数据源只存 `beads: { uid, typeId }[]`，所有几何位置都是这个数组的纯函数派生。
增删 → 数组变 → `motion.div layout` 自动 FLIP 重排，spring 200/22。

光源：高光方向 = 该珠子相对画布中心的反方向（统一光源），让整圈球面在视觉上像同一盏灯照过来。

## AI 能力（赛道分别如何 hit）

赛道三「即时满足」：
- 6 个快捷意图气泡（压力大、招财、桃花、平安、专注、自信），点了 → 800ms 内出方案 → 珠子顺时针逐颗落位 → 寄语浮现，全程无跳转。
- 选中任一珠子 → 浮现寓意小卡（"紫水晶 · 安抚情绪 平静思绪"），给"懂你"的瞬间。
- 完成设计 → 翻面成可分享海报卡（带二维码占位、主题、寄语、手围）。

赛道二「内容重构（可选扩展）」：
- 接同一 schema：贴一段水晶视频链接 → 让 AI 解析配方 JSON → 一键复刻入环 → 在画布上微调。
- 当前仓库的 `recommendRecipe` 接口已留出 url 输入位（沿用同一 prompt schema）。

### AI 协议

输入：用户中文意图字符串。
输出：固定 JSON schema（`response_format: json_object`）：

```jsonc
{
  "intent": "用户原话",
  "theme":  "5 字内主题名",
  "copy":   "30 字内能量寄语",
  "beads":  [
    { "typeId": "amethyst-10", "count": 8, "reason": "紫水晶安抚情绪" }
  ]
}
```

`typeId` 必须来自前端预定义的 catalog（白/紫/黄/粉/绿/黑曜石 × 8/10/12mm + 银金隔片/隔珠/花托）。
前端会做兜底校验（不识别的 typeId 丢弃，beads 数量限幅 1-14）。

### 本地 mock 与现场切换

不配 key 时走 `KEYWORD_TABLE`（关键词正则匹配预设方案），保证现场断网/凭证失效也能演示。
配置 `VITE_AI_BASE` / `VITE_AI_KEY` / `VITE_AI_MODEL` 即切到真模型，前端先打真接口失败再回 mock。
**部署演示一定换公网模型**——评委手机连场馆网络访问不到内网 vLLM。

## 目录

```
src/
  ai/recipe.ts              // AI 调用 + mock + 关键词表
  components/
    Bead.tsx                // 单颗珠子（CSS 渐变球体 + 高光 + 投影）
    Canvas.tsx              // 中央画布 + 圆环组装 + FLIP 动画
    StatusBar.tsx           // 顶部胶囊：手围/总价/校验
    Drawer.tsx              // 底部抽屉：tab/分类/卡片
    ActionBar.tsx           // 清空/保存/完成设计
    AIPanel.tsx             // AI 输入面板（含 shimmer）
    PosterModal.tsx         // 完成设计后的翻面海报
    MeaningCard.tsx         // 选中珠子时的寓意卡
    Splash.tsx              // 首屏开场（模拟从抖音信息流上滑）
    CountUp.tsx             // 数值滚动
  data/catalog.ts           // 水晶 / 配饰 颜色配方 + 价格 + 寓意
  lib/ringLayout.ts         // 圆环布局引擎（核心）
  state/store.ts            // Zustand store + derive 函数
  index.css                 // 主题 / 玻璃 / 呼吸渐变
```

## 开发

```bash
cd web
npm install
npm run dev      # http://localhost:5173/
npm run build    # 产出 dist/，静态托管即可
```

可选环境变量（`web/.env.local`）：

```
VITE_AI_BASE=https://api.openai.com/v1
VITE_AI_KEY=sk-xxx
VITE_AI_MODEL=gpt-4o-mini
```

## 部署

任意静态托管：Cloudflare Pages / Vercel / OSS+CDN，把 `dist/` 推上去。
**Day 1 晚一定要在场馆网络下用别人手机扫一次二维码**——这是 hackathon 翻车率最高的一步。

## 评分对位

赛道三 100 分锚点 → 我们的命中：

| 维度 | 权重 | 怎么命中 |
|---|---|---|
| 场景与问题洞察 | 20% | "今日心情→一串水晶"，明确"刷到此刻"的瞬间 |
| AI 能力与产品结合 | 15% | AI 直出可执行 JSON 驱动 UI，不是文字回答 |
| 体验完整性 | 30% | 零跳转/零教程，1 秒看懂、3 秒上手、30 秒成片 |
| 用户价值感 | 20% | 即时拿到一个具象的能量物件 + 寓意解读 |
| 创新性与延展潜力 | 15% | "每日水晶"可天天刷新，配合天气/节气持续变化 |

## 团队

- 队名：[填写]
- 成员：[姓名 / 学校 / 年级 / 分工]
- 口号：把今天的小心愿，串成一圈光

## 演示话术（30 秒）

> 想象你刷抖音刷到一张卡片，写着「最近压力大想要平静」。点一下，紫水晶一颗颗落进圆环，手围跳动，金句浮现，再点几下加自己喜欢的颗——这就是今日你的水晶。
> 我们做了一个「刷到即用」的水晶 DIY 设计器，AI 只负责一件事：把心情翻译成珠子。整套体验零跳转、零教程，30 秒内成片。
