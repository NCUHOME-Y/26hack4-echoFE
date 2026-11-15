// 争议海螺列表 mock：字段与后端问题列表接口保持一致
export interface DebateItem {
  id: number
  description: string
  picked_count: number
  created_at: string
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

const DEBATES: DebateItem[] = [
  { id: 1, description: '该不该去看这场演唱会', picked_count: 128, created_at: hoursAgo(1) },
  { id: 2, description: '要不要为了合群参加不想去的聚会', picked_count: 96, created_at: hoursAgo(3) },
  { id: 3, description: '朋友借的钱一直不还，该开口要吗', picked_count: 87, created_at: hoursAgo(6) },
  { id: 4, description: '发现室友偷偷用我的东西，要说破吗', picked_count: 74, created_at: hoursAgo(10) },
  { id: 5, description: '考研还是直接工作', picked_count: 65, created_at: hoursAgo(22) },
  { id: 6, description: '该不该把前任送的礼物还回去', picked_count: 52, created_at: hoursAgo(30) },
  { id: 7, description: '周末去图书馆还是在家赶作业', picked_count: 41, created_at: hoursAgo(48) },
  { id: 8, description: '水杯买粉色还是蓝色', picked_count: 23, created_at: hoursAgo(70) },
]

// 最新在上，最多 100 条
export async function getDebates(): Promise<DebateItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return [...DEBATES]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 100)
}