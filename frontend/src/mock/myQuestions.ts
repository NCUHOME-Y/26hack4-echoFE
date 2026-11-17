// 对应 GET /api/users/me/questions，字段与 openapi 一致
import { getCurrentUser } from './auth'

export interface MyQuestion {
  id: number
  description: string
  status: 'open' | 'closed'
  expires_at: string
  created_at: string
  settled_at: string | null
  contested_at: string | null
  total_votes: number
}

export interface MyQuestionPage {
  list: MyQuestion[]
  returned: number
  total: number
}

export const MY_QUESTION_LIMIT = 20
export const SETTLED_KEEP_MS = 24 * 60 * 60 * 1000

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

const MY_QUESTIONS: MyQuestion[] = [
  { id: 201, description: '测试一下打很多字的情况12345678901234567890123456789012345678901234567890周末去图书馆还是在家赶作业', status: 'open', expires_at: hoursAgo(-5), created_at: hoursAgo(3), settled_at: null, contested_at: null, total_votes: 12 },
  { id: 202, description: '换新手机还是攒钱换电脑', status: 'open', expires_at: hoursAgo(-20), created_at: hoursAgo(4), settled_at: null, contested_at: null, total_votes: 8 },
  { id: 203, description: '水杯买粉色还是蓝色', status: 'closed', expires_at: hoursAgo(2), created_at: hoursAgo(26), settled_at: hoursAgo(2), contested_at: null, total_votes: 34 },
  { id: 204, description: '要不要为了合群参加不想去的聚会', status: 'closed', expires_at: hoursAgo(6), created_at: hoursAgo(30), settled_at: hoursAgo(6), contested_at: hoursAgo(6), total_votes: 96 },
  { id: 205, description: '这条已结算 25 小时，应该看不到', status: 'closed', expires_at: hoursAgo(25), created_at: hoursAgo(50), settled_at: hoursAgo(25), contested_at: null, total_votes: 40 },
  { id: 206, description: '早上跑步还是晚上跑步', status: 'closed', expires_at: hoursAgo(20), created_at: hoursAgo(44), settled_at: hoursAgo(20), contested_at: null, total_votes: 22 },
  // 一条投票都没有：用来验证结算页的「没人捡起海螺」空态
  { id: 207, description: '还没人捡起这颗海螺：周五晚上要不要去看球', status: 'open', expires_at: hoursAgo(-8), created_at: hoursAgo(2), settled_at: null, contested_at: null, total_votes: 0 },
]

// 已结算只留 24h 内；未结算在上、已结算在下；组内越新越上；最多 20 条
export function displayMyQuestions(list: MyQuestion[], now = Date.now()): MyQuestion[] {
  const recent = list.filter(
    (q) => q.settled_at === null || now - new Date(q.settled_at).getTime() <= SETTLED_KEEP_MS,
  )
  const byNewest = (a: MyQuestion, b: MyQuestion) => b.created_at.localeCompare(a.created_at)
  const open = recent.filter((q) => q.settled_at === null).sort(byNewest)
  const settled = recent.filter((q) => q.settled_at !== null).sort(byNewest)
  return [...open, ...settled].slice(0, MY_QUESTION_LIMIT)
}

function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getMyQuestions(): Promise<MyQuestionPage> {
  await sleep()
  if (!getCurrentUser()) throw new Error('未登录或登录已失效')
  const list = displayMyQuestions(MY_QUESTIONS)
  return { list, returned: list.length, total: MY_QUESTIONS.length }
}