// 水晶 / 配饰 数据目录
// 单价为含税示例价（¥/颗），尺寸 mm

export type BeadKind = 'crystal' | 'accessory';

export interface BeadType {
  id: string;             // 'amethyst-8' 唯一规格 id
  category: string;       // '紫水晶' '白水晶' '隔片' 等
  kind: BeadKind;
  name: string;           // 显示名
  size: number;           // 直径 mm
  price: number;          // 元
  // 渲染用的颜色配方（CSS variables 直接写入 radial-gradient）
  highlight: string;      // 高光色
  body: string;           // 主体色（中调）
  shadow: string;         // 暗部色
  rim: string;            // 边缘色（薄薄一圈）
  // 用于全局氛围
  themeHue: number;       // 0-360 主调
  meaning: string;        // 寓意一句话
}

export const CATEGORIES: { id: string; name: string; kind: BeadKind }[] = [
  { id: 'white',     name: '白水晶', kind: 'crystal' },
  { id: 'amethyst',  name: '紫水晶', kind: 'crystal' },
  { id: 'citrine',   name: '黄水晶', kind: 'crystal' },
  { id: 'rose',      name: '粉水晶', kind: 'crystal' },
  { id: 'green',     name: '绿幽灵', kind: 'crystal' },
  { id: 'obsidian',  name: '黑曜石', kind: 'crystal' },
  { id: 'spacer',    name: '隔片',   kind: 'accessory' },
  { id: 'divider',   name: '隔珠',   kind: 'accessory' },
  { id: 'flower',    name: '花托',   kind: 'accessory' },
];

const SIZES = [8, 10, 12];

const presets: Record<string, Omit<BeadType, 'id' | 'size' | 'price' | 'kind'>> = {
  white: {
    category: '白水晶', name: '白水晶',
    highlight: '#ffffff', body: '#f1ecff', shadow: '#b9b3d4', rim: '#fbf9ff',
    themeHue: 260, meaning: '净化磁场 · 提升专注，开运基石。',
  },
  amethyst: {
    category: '紫水晶', name: '紫水晶',
    highlight: '#f3e9ff', body: '#a073d8', shadow: '#3f2a6e', rim: '#dac4ff',
    themeHue: 280, meaning: '安抚情绪 · 平静思绪，提升直觉。',
  },
  citrine: {
    category: '黄水晶', name: '黄水晶',
    highlight: '#fff7d8', body: '#f6c542', shadow: '#9c6f00', rim: '#ffe7a3',
    themeHue: 45, meaning: '招财聚气 · 提升信心，温暖能量。',
  },
  rose: {
    category: '粉水晶', name: '粉水晶',
    highlight: '#fff0f6', body: '#f4a3c0', shadow: '#a0506c', rim: '#ffd2e2',
    themeHue: 340, meaning: '柔化关系 · 招桃花，温柔自爱。',
  },
  green: {
    category: '绿幽灵', name: '绿幽灵',
    highlight: '#e8ffec', body: '#5fb38a', shadow: '#1f5d44', rim: '#bce6cf',
    themeHue: 150, meaning: '事业稳进 · 招正财，扎根成长。',
  },
  obsidian: {
    category: '黑曜石', name: '黑曜石',
    highlight: '#5a5a73', body: '#1c1d2a', shadow: '#000000', rim: '#3a3b50',
    themeHue: 220, meaning: '辟邪挡煞 · 化解负能，护身常带。',
  },
};

const CRYSTAL_TYPES: BeadType[] = [];
for (const cat of CATEGORIES.filter((c) => c.kind === 'crystal')) {
  const p = presets[cat.id];
  for (const s of SIZES) {
    CRYSTAL_TYPES.push({
      id: `${cat.id}-${s}`,
      kind: 'crystal',
      size: s,
      price: { 8: 18, 10: 28, 12: 38 }[s] ?? 28,
      ...p,
    });
  }
}

const ACCESSORY_TYPES: BeadType[] = [
  {
    id: 'spacer-silver-3',
    kind: 'accessory',
    category: '隔片', name: '银隔片',
    size: 3, price: 6,
    highlight: '#ffffff', body: '#d6d6e0', shadow: '#5a5a72', rim: '#f0f0f7',
    themeHue: 220, meaning: '点缀过渡 · 让搭配更精致。',
  },
  {
    id: 'spacer-gold-3',
    kind: 'accessory',
    category: '隔片', name: '金隔片',
    size: 3, price: 8,
    highlight: '#fff7d8', body: '#e8c777', shadow: '#7d5a14', rim: '#fbe9a6',
    themeHue: 45, meaning: '点缀过渡 · 暖金提亮气质。',
  },
  {
    id: 'divider-silver-5',
    kind: 'accessory',
    category: '隔珠', name: '银隔珠',
    size: 5, price: 10,
    highlight: '#ffffff', body: '#cfd1de', shadow: '#4d4f60', rim: '#ebebf3',
    themeHue: 220, meaning: '分段呼吸 · 让节奏更舒展。',
  },
  {
    id: 'divider-gold-5',
    kind: 'accessory',
    category: '隔珠', name: '金隔珠',
    size: 5, price: 12,
    highlight: '#fff5cd', body: '#e6be62', shadow: '#7a5612', rim: '#fcdf94',
    themeHue: 45, meaning: '分段呼吸 · 暖色系点睛。',
  },
  {
    id: 'flower-silver-7',
    kind: 'accessory',
    category: '花托', name: '银花托',
    size: 7, price: 16,
    highlight: '#ffffff', body: '#cfd0dc', shadow: '#4a4b62', rim: '#ededf5',
    themeHue: 220, meaning: '托衬主珠 · 强化中心。',
  },
  {
    id: 'flower-gold-7',
    kind: 'accessory',
    category: '花托', name: '金花托',
    size: 7, price: 20,
    highlight: '#fff5cd', body: '#e3bb5d', shadow: '#75520f', rim: '#fbdc8d',
    themeHue: 45, meaning: '托衬主珠 · 暖金高级感。',
  },
];

export const ALL_TYPES: BeadType[] = [...CRYSTAL_TYPES, ...ACCESSORY_TYPES];

export function findType(id: string): BeadType | undefined {
  return ALL_TYPES.find((t) => t.id === id);
}

export function typesByCategory(catId: string): BeadType[] {
  return ALL_TYPES.filter((t) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    return cat ? t.category === cat.name : false;
  });
}
