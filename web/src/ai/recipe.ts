// AI: 意图 → 配方
// 默认提供 mock 实现（保证现场零依赖跑通），可通过 VITE_AI_BASE / VITE_AI_KEY 切到真实 API。
// 真实 API 走 OpenAI 兼容协议 (chat/completions, response_format json_object)。

import { ALL_TYPES, type BeadType } from '../data/catalog';
import type { AIRecipe } from '../state/store';

const SYS = `你是一名水晶手串设计师，根据用户意图返回 JSON 配方。
仅输出 JSON，不要解释。schema:
{
  "intent": "用户原话精炼",
  "theme": "命名主题（5字内）",
  "copy":  "30字内一句能量寄语",
  "beads": [
    { "typeId": "<必须来自候选 id>", "count": 数量(2-12), "reason": "选它的理由(15字内)" }
  ]
}
要求：beads 共 14-18 颗，含至少 1 个配饰；按风水/能量学合理搭配；颜色和谐。`;

function candidateIdList(): string {
  return ALL_TYPES.map((t) => `${t.id} (${t.name} ${t.size}mm ¥${t.price})`).join('\n');
}

const KEYWORD_TABLE: { kw: RegExp; pick: { typeId: string; count: number; reason: string }[]; theme: string; copy: string }[] = [
  {
    kw: /(平静|焦虑|失眠|压力|静)/,
    theme: '夜阑安神',
    copy: '把今晚的心跳放慢一拍，让月光替你喘口气。',
    pick: [
      { typeId: 'amethyst-10', count: 10, reason: '紫水晶安抚情绪' },
      { typeId: 'white-8',     count: 4,  reason: '白水晶净化思绪' },
      { typeId: 'spacer-silver-3', count: 2, reason: '银隔片节奏感' },
    ],
  },
  {
    kw: /(招财|财富|赚|事业|工作|加薪)/,
    theme: '金光进宝',
    copy: '让每一笔流水都顺着腕间转一圈再回来。',
    pick: [
      { typeId: 'citrine-10', count: 10, reason: '黄水晶招财气' },
      { typeId: 'green-8',    count: 4,  reason: '绿幽灵稳事业' },
      { typeId: 'divider-gold-5', count: 2, reason: '金隔珠点睛' },
    ],
  },
  {
    kw: /(桃花|爱情|恋爱|脱单|感情)/,
    theme: '心动绒粉',
    copy: '心跳柔软的人，吸引同样温柔的相遇。',
    pick: [
      { typeId: 'rose-10',  count: 10, reason: '粉水晶招桃花' },
      { typeId: 'white-8',  count: 4,  reason: '白水晶纯净意念' },
      { typeId: 'flower-silver-7', count: 1, reason: '银花托提气质' },
    ],
  },
  {
    kw: /(辟邪|护身|挡煞|平安|出差|出行)/,
    theme: '夜行护佑',
    copy: '把不安留给珠子，把安心留给自己。',
    pick: [
      { typeId: 'obsidian-12', count: 6, reason: '黑曜石辟邪' },
      { typeId: 'white-10',    count: 6, reason: '白水晶净化' },
      { typeId: 'divider-silver-5', count: 2, reason: '银隔珠节奏' },
    ],
  },
  {
    kw: /(专注|学习|考试|读书|deadline)/,
    theme: '清醒之光',
    copy: '让脑海像一面无尘的镜子，专注一件事。',
    pick: [
      { typeId: 'white-10',    count: 8, reason: '白水晶提升专注' },
      { typeId: 'amethyst-8',  count: 6, reason: '紫水晶清明思绪' },
      { typeId: 'spacer-silver-3', count: 2, reason: '银隔片轻盈感' },
    ],
  },
  {
    kw: /(自信|表达|上台|演讲|社交)/,
    theme: '暖阳生辉',
    copy: '把胸口那束光，先讲给自己听。',
    pick: [
      { typeId: 'citrine-10', count: 8, reason: '黄水晶提升自信' },
      { typeId: 'rose-8',     count: 6, reason: '粉水晶柔软表达' },
      { typeId: 'flower-gold-7', count: 1, reason: '金花托主珠' },
    ],
  },
];

function mockRecipe(intent: string): AIRecipe {
  const hit = KEYWORD_TABLE.find((r) => r.kw.test(intent));
  const pack = hit ?? {
    theme: '今日水晶',
    copy: '愿这一圈光，托住你今天的小心愿。',
    pick: [
      { typeId: 'amethyst-10', count: 8, reason: '紫水晶日常陪伴' },
      { typeId: 'white-8',     count: 6, reason: '白水晶基础净化' },
      { typeId: 'spacer-silver-3', count: 2, reason: '银隔片点缀' },
    ],
  };
  return {
    intent: intent || '今日能量',
    theme: pack.theme,
    copy: pack.copy,
    beads: pack.pick,
  };
}

async function realRecipe(intent: string, signal?: AbortSignal): Promise<AIRecipe> {
  const base = import.meta.env.VITE_AI_BASE as string | undefined;
  const key  = import.meta.env.VITE_AI_KEY  as string | undefined;
  const model = (import.meta.env.VITE_AI_MODEL as string | undefined) ?? 'gpt-4o-mini';
  if (!base || !key) throw new Error('AI 未配置');

  const body = {
    model,
    messages: [
      { role: 'system', content: SYS + '\n候选 typeId:\n' + candidateIdList() },
      { role: 'user',   content: intent },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  };

  const resp = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
    signal,
  });
  if (!resp.ok) throw new Error(`AI ${resp.status}`);
  const j = await resp.json();
  const txt: string = j?.choices?.[0]?.message?.content ?? '';
  const parsed = JSON.parse(txt);
  return normalize(parsed, intent);
}

function normalize(p: unknown, intent: string): AIRecipe {
  const obj = (p ?? {}) as Record<string, unknown>;
  const beadsRaw = (obj.beads ?? []) as { typeId?: string; count?: number; reason?: string }[];
  const valid = (id?: string): id is string => !!id && ALL_TYPES.some((t: BeadType) => t.id === id);
  const beads = beadsRaw
    .filter((b) => valid(b.typeId))
    .map((b) => ({
      typeId: b.typeId as string,
      count: Math.max(1, Math.min(14, Number(b.count) || 1)),
      reason: String(b.reason ?? ''),
    }));
  return {
    intent: String(obj.intent ?? intent),
    theme:  String(obj.theme ?? '今日水晶'),
    copy:   String(obj.copy ?? ''),
    beads:  beads.length ? beads : mockRecipe(intent).beads,
  };
}

export async function recommendRecipe(intent: string, signal?: AbortSignal): Promise<AIRecipe> {
  const hasReal = !!import.meta.env.VITE_AI_BASE && !!import.meta.env.VITE_AI_KEY;
  if (hasReal) {
    try {
      return await realRecipe(intent, signal);
    } catch (e) {
      console.warn('AI 调用失败，回退到 mock', e);
    }
  }
  // 模拟一点延迟，让 shimmer 看起来像在思考
  await new Promise((r) => setTimeout(r, 800));
  return mockRecipe(intent);
}

export const QUICK_PROMPTS = [
  '最近压力大想要平静',
  '希望事业顺利招财',
  '想吸引温柔的桃花',
  '出差希望平安护身',
  'deadline 太多需要专注',
  '面试上台要有自信',
];
