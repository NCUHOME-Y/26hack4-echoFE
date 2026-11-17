// 争议海螺 mock：字段严格对齐 openapi.yaml 的 /api/questions/contested 与 /api/questions/{id}
export interface DebateOption {
  id: number
  label: string
  sort_no: number
  votes: number
  percent: number
}

export interface DebateItem {
  id: number
  description: string
  status: 'closed'
  expires_at: string
  created_at: string
  settled_at: string
  contested_at: string
  total_votes: number
  options: DebateOption[]
}
// 与 /api/questions/contested 的 data 结构一致
export interface PageResult<T> {
  list: T[]
  returned: number
  total: number
}

export interface DebateDetail extends DebateItem {
  final_option_id: number | null
  option_count: 2 | 3 | 4
  can_vote: boolean
  my_vote: { option_id: number; created_at: string } | null
  asker: { id: number; nickname: string; avatar: string; level: number }
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

const DEBATES: DebateItem[] = [
  {
    id: 1,
    description: '傍晚的风轻轻拂过窗台，带走一点白日的燥热。静下心来看看周遭，日子平淡却也藏着细碎温柔。不必总追赶远方，偶尔放慢脚步，喝杯水，发会儿呆，接纳所有不完美。好好照顾自己，认真对待三餐与睡眠，在平凡时光里慢慢积攒属于自己的光亮，稳步向前就很好。',
    status: 'closed',
    expires_at: hoursAgo(2),
    created_at: hoursAgo(26),
    settled_at: hoursAgo(2),
    contested_at: hoursAgo(1),
    total_votes: 128,
    options: [
      { id: 11, label: '去，青春只有一次', sort_no: 1, votes: 62, percent: 48.4 },
      { id: 12, label: '不去，先把正事做完', sort_no: 2, votes: 48, percent: 37.5 },
      { id: 13, label: '看情况再说', sort_no: 3, votes: 18, percent: 14.1 },
    ],
  },
  {
    id: 2,
    description: '要不要为了合群参加不想去的聚会',
    status: 'closed',
    expires_at: hoursAgo(4),
    created_at: hoursAgo(30),
    settled_at: hoursAgo(4),
    contested_at: hoursAgo(3),
    total_votes: 96,
    options: [
      { id: 21, label: '去，别扫大家的兴', sort_no: 1, votes: 49, percent: 51.0 },
      { id: 22, label: '不去，舒服最重要', sort_no: 2, votes: 47, percent: 49.0 },
    ],
  },
  {
    id: 3,
    description: '朋友借的钱一直不还，该开口要吗',
    status: 'closed',
    expires_at: hoursAgo(7),
    created_at: hoursAgo(34),
    settled_at: hoursAgo(7),
    contested_at: hoursAgo(6),
    total_votes: 87,
    options: [
      { id: 31, label: '直接开口要', sort_no: 1, votes: 45, percent: 51.7 },
      { id: 32, label: '再等等，别伤感情', sort_no: 2, votes: 42, percent: 48.3 },
    ],
  },
  {
    id: 4,
    description: '发现室友偷偷用我的东西，要说破吗',
    status: 'closed',
    expires_at: hoursAgo(11),
    created_at: hoursAgo(40),
    settled_at: hoursAgo(11),
    contested_at: hoursAgo(10),
    total_votes: 74,
    options: [
      { id: 41, label: '说破，边界要讲清楚', sort_no: 1, votes: 35, percent: 47.3 },
      { id: 42, label: '不说，默默收好自己的东西', sort_no: 2, votes: 39, percent: 52.7 },
    ],
  },
  {
    id: 5,
    description: '考研还是直接工作',
    status: 'closed',
    expires_at: hoursAgo(24),
    created_at: hoursAgo(60),
    settled_at: hoursAgo(24),
    contested_at: hoursAgo(22),
    total_votes: 65,
    options: [
      { id: 51, label: '考研', sort_no: 1, votes: 34, percent: 52.3 },
      { id: 52, label: '直接工作', sort_no: 2, votes: 31, percent: 47.7 },
    ],
  },
  {
    id: 6,
    description: '该不该把前任送的礼物还回去',
    status: 'closed',
    expires_at: hoursAgo(32),
    created_at: hoursAgo(72),
    settled_at: hoursAgo(32),
    contested_at: hoursAgo(30),
    total_votes: 52,
    options: [
      { id: 61, label: '还，断干净', sort_no: 1, votes: 24, percent: 46.2 },
      { id: 62, label: '留着，也是回忆', sort_no: 2, votes: 28, percent: 53.8 },
    ],
  },
  {
    id: 7,
    description: '周末去图书馆还是在家赶作业',
    status: 'closed',
    expires_at: hoursAgo(50),
    created_at: hoursAgo(90),
    settled_at: hoursAgo(50),
    contested_at: hoursAgo(48),
    total_votes: 41,
    options: [
      { id: 71, label: '图书馆', sort_no: 1, votes: 22, percent: 53.7 },
      { id: 72, label: '在家', sort_no: 2, votes: 19, percent: 46.3 },
    ],
  },
  {
    id: 8,
    description: '水杯买粉色还是蓝色',
    status: 'closed',
    expires_at: hoursAgo(72),
    created_at: hoursAgo(120),
    settled_at: hoursAgo(72),
    contested_at: hoursAgo(70),
    total_votes: 33,
    options: [
      { id: 81, label: '粉色', sort_no: 1, votes: 17, percent: 51.5 },
      { id: 82, label: '蓝色', sort_no: 2, votes: 16, percent: 48.5 },
    ],
  },
]

// 海螺公布的最终选择
const FINAL_OPTION: Record<number, number> = {
  1: 11,
  2: 21,
  3: 31,
  4: 42,
  5: 51,
  6: 62,
  7: 71,
  8: 81,
}


function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toDetail(item: DebateItem): DebateDetail {
  return {
    ...item,
    final_option_id: FINAL_OPTION[item.id] ?? null,
    option_count: item.options.length as 2 | 3 | 4,
    // 争议题只读：已结算的题不能再投票，这两个字段只为了对齐接口
    can_vote: false,
    my_vote: null,
    asker: { id: 2, nickname: '海螺观察员', avatar: 'avatar-3', level: 12 },
  }
}

// 争议海螺列表：按 contested_at 倒序，固定最多 100 条
export async function getDebates(): Promise<PageResult<DebateItem>> {
  await sleep()
  const sorted = [...DEBATES].sort((a, b) => b.contested_at.localeCompare(a.contested_at))
  const page = sorted.slice(0, 100)
  // total 是总数，returned 是本次实际返回的条数，两者可能不等
  return { list: page, returned: page.length, total: sorted.length }
}
// 对应 GET /api/questions/{id}
export async function getDebateDetail(id: number): Promise<DebateDetail> {
  await sleep()
  const item = DEBATES.find((question) => question.id === id)
  if (!item) throw new Error('问题不存在')
  return toDetail(item)
}
