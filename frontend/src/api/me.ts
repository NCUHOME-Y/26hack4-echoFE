//我的 资料、头像、我参与的、我的海螺
import { get, patch } from './request'

export const EXP_PER_LEVEL = 50

//对应GET /api/users/me的data
export interface MeProfile {
  id: number
  account: string
  nickname: string
  avatar: string
  exp: number
  level: number
  level_progress: number
  created_at: string
  updated_at?: string //后端json:"-"不返回，标成可选
}

//对应GET /api/users/me/answers的list项
export interface AnswerItem {
  question_id: number
  description: string
  status: 'open' | 'closed'
  my_option_id: number
  my_option_label: string
  final_option_id: number | null
  matched: boolean | null
  voted_at: string
  settled_at: string | null
}

//对应GET /api/users/me/questions的list项
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

//后端所有分页接口的统一外壳，没有returned字段
interface PageData<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

//展示三态由前端推导，后端只给open/closed
export type ParticipationStatus = 'settled' | 'open' | 'lost'

export function participationStatus(item: AnswerItem): ParticipationStatus {
  if (item.settled_at === null) return 'open' //还没结算
  if (item.final_option_id === null) return 'lost' //已结算但发布者没选 → 沉入大海
  return 'settled'
}

export const PARTICIPATION_STATUS_TEXT: Record<ParticipationStatus, string> = {
  settled: '已结算',
  open: '未结算',
  lost: '沉入大海',
}

export function getMe(): Promise<MeProfile> {
  return get<MeProfile>('/users/me')
}

export function updateAvatar(avatar: string): Promise<{ avatar: string }> {
  return patch<{ avatar: string }>('/users/me/avatar', { avatar })
}

//我参与的：关键词在后端过滤，一次拉100条够列表用
export async function getMyParticipations(keyword = ''): Promise<AnswerItem[]> {
  const data = await get<PageData<AnswerItem>>('/users/me/answers', {
    keyword,
    page: 1,
    page_size: 100,
  })
  return data.list
}
//我的海螺前端展示规则：已结算只保留24小时、未结算在上、组内越新越上、最多20条
export const MY_QUESTION_LIMIT = 20
export const SETTLED_KEEP_MS = 24 * 60 * 60 * 1000

export function displayMyQuestions(list: MyQuestion[], now = Date.now()): MyQuestion[] {
  const recent = list.filter(
    (q) => q.settled_at === null || now - new Date(q.settled_at).getTime() <= SETTLED_KEEP_MS,
  )
  const byNewest = (a: MyQuestion, b: MyQuestion) => b.created_at.localeCompare(a.created_at)
  const open = recent.filter((q) => q.settled_at === null).sort(byNewest)
  const settled = recent.filter((q) => q.settled_at !== null).sort(byNewest)
  return [...open, ...settled].slice(0, MY_QUESTION_LIMIT)
}
//我的海螺：后端按创建时间倒序返回原始列表，24小时过滤和20条上限在这里统一处理
export async function getMyQuestions(): Promise<{ list: MyQuestion[]; total: number }> {
  const data = await get<PageData<MyQuestion>>('/users/me/questions', {
    page: 1,
    page_size: 100,
  })
  return { list: displayMyQuestions(data.list), total: data.total }
}
//为什么`page_size`给100而不是20？因为已结算只留24小时内是前端过滤。如果只拉20条，其中15条是超过24h的旧题被滤掉，页面就只剩5条。拉100条再过滤，才能凑够20条展示。100是后端上限