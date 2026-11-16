//全是ai生成的，但我看了一下
// 「我的」页本地 mock：返回字段与后端 GET /api/users/me 保持一致
import { AVATAR_IDS } from '../assets/avatars'
import { getCurrentUser, saveCurrentUser } from './auth'

export const EXP_PER_LEVEL = 50
export const MAX_EXP = 9999

// 与后端 model.User 的返回字段同名，切换真接口时只换实现
export interface MeProfile {
  id: number
  account: string
  nickname: string
  avatar: string
  exp: number
  level: number
  level_progress: number
  created_at: string
  updated_at: string
}

//对应GET /api/users/me/answers 的列表项
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

//展示用的三态是前端推导的 不是后端返回的字段
export type ParticipationStatus = 'settled' | 'open' | 'lost'

export function participationStatus(item: AnswerItem): ParticipationStatus {
  if (item.settled_at === null) return 'open'      // 还没结算
  if (item.final_option_id === null) return 'lost' // 已结算但发布者没选 → 沉入大海
  return 'settled'
}

export const PARTICIPATION_STATUS_TEXT: Record<ParticipationStatus, string> = {
  settled: '已结算',
  open: '未结算',
  lost: '沉入大海',
}

function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// 和后端一致：exp / 50 得等级，余数是本级进度；前端展示封顶 9999
export function levelOf(exp: number): { level: number; level_progress: number } {
  const safe = Math.min(Math.max(exp, 0), MAX_EXP)
  return {
    level: Math.floor(safe / EXP_PER_LEVEL),
    level_progress: safe % EXP_PER_LEVEL,
  }
}

// 对应 GET /api/users/me
export async function getMe(): Promise<MeProfile> {
  await sleep()
  const user = getCurrentUser()
  if (!user) throw new Error('未登录或登录已失效')

  // 早期 mock 账号没有 exp 字段，兜底为 0
  const exp = typeof user.exp === 'number' ? user.exp : 0
  const { level, level_progress } = levelOf(exp)

  return {
    id: user.id,
    account: user.account,
    nickname: user.nickname,
    avatar: user.avatar,
    exp,
    level,
    level_progress,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

// 对应 PATCH /api/users/me/avatar
export async function updateAvatar(avatar: string): Promise<{ avatar: string }> {
  await sleep()
  if (!(AVATAR_IDS as readonly string[]).includes(avatar)) {
    throw new Error('头像不存在')
  }
  const user = getCurrentUser()
  if (!user) throw new Error('未登录或登录已失效')

  saveCurrentUser({ ...user, avatar, updated_at: new Date().toISOString() })
  return { avatar }
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

// 预置的参与记录；真实数据由后端返回，这里只负责让页面先跑起来
const ANSWERS: AnswerItem[] = [
  { question_id: 101, description: '周末去图书馆还是在家赶作业', status: 'closed', my_option_id: 1, my_option_label: '图书馆', final_option_id: 1, matched: true, voted_at: hoursAgo(2), settled_at: hoursAgo(1) },
  { question_id: 102, description: '换新手机还是攒钱换电脑', status: 'open', my_option_id: 2, my_option_label: '换电脑', final_option_id: null, matched: null, voted_at: hoursAgo(5), settled_at: null },
  { question_id: 103, description: '我该逃掉重要的专业课去看演唱会吗', status: 'closed', my_option_id: 1, my_option_label: '不逃课', final_option_id: 2, matched: false, voted_at: hoursAgo(26), settled_at: hoursAgo(20) },
  { question_id: 104, description: '水杯买粉色还是蓝色', status: 'closed', my_option_id: 1, my_option_label: '粉色', final_option_id: null, matched: null, voted_at: hoursAgo(50), settled_at: hoursAgo(48) },
  { question_id: 105, description: '要不要为了买衣服省吃俭用一周', status: 'closed', my_option_id: 2, my_option_label: '不要省', final_option_id: 2, matched: true, voted_at: hoursAgo(72), settled_at: hoursAgo(60) },
  { question_id: 106, description: '这个手机该不该换', status: 'closed', my_option_id: 1, my_option_label: '该换', final_option_id: null, matched: null, voted_at: hoursAgo(96), settled_at: hoursAgo(90) },
  { question_id: 107, description: '朋友说的话总伤到我，是我敏感了吗', status: 'closed', my_option_id: 2, my_option_label: '不是敏感', final_option_id: 2, matched: true, voted_at: hoursAgo(120), settled_at: hoursAgo(110) },
  { question_id: 108, description: '早上跑步还是晚上跑步', status: 'open', my_option_id: 2, my_option_label: '晚上', final_option_id: null, matched: null, voted_at: hoursAgo(140), settled_at: null },
]

export async function getMyParticipations(keyword = ''): Promise<AnswerItem[]> {
  await sleep()
  const kw = keyword.trim()
  return ANSWERS
    .filter((item) => !kw || item.description.includes(kw))
    .sort((a, b) => b.voted_at.localeCompare(a.voted_at)) // 按投票时间越新越上
    .slice(0, 100)
}