import { DEFAULT_AVATAR } from '../assets/avatars'
import { getCurrentUser, saveCurrentUser } from './auth'

export const EXP_PER_LEVEL = 50    

export interface AnswerOption {
  id: number
  text: string
  votes: number
}

export interface AnswerQuestion {
  id: number
  title: string
  options: AnswerOption[]
  created_at: string      // 题目发出的那一刻，回收时间从这里开始算
  expires_at: string      // 回收时间点 = created_at + 回收时长
  exp: number
  is_author: boolean      // 当前用户是不是发问者（发问者可删所有评论）
}



export interface MeInfo {
  id: number
  nickname: string
  avatar: string
  exp: number
}

export function getMe(): MeInfo {
  const user = getCurrentUser()
  if (!user) {
    // 没登录时
    return { id: 0, nickname: '海螺用户', avatar: DEFAULT_AVATAR, exp: 0 }
  }
  return {
    id: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    exp: user.exp,
  }
}

export function levelInfo(exp: number) {
  return {
    level: Math.floor(exp / EXP_PER_LEVEL),
    progress: exp % EXP_PER_LEVEL,
  }
}


// 回收时长
function chineseNumber(n: number) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (n <= 9) return digits[n]
  if (n === 10) return '十'
  return String(n)
}


export function recycleLabel(createdAt: string, expiresAt: string) {
  const start = new Date(createdAt).getTime()
  const end = new Date(expiresAt).getTime()
  const hours = (end - start) / 3600000

  if (hours < 24) {
    if (hours < 1) return '1小时内'
    return `${Math.round(hours)}小时后`
  }

  const days = Math.round(hours / 24)
  return `${chineseNumber(days)}天后`
}

interface QuestionSeed {
  id: number
  title: string
  options: AnswerOption[]
  is_author: boolean
  created_minutes_ago: number     
  recycle_hours: number           
}

const QUESTION_POOL: QuestionSeed[] = [
  {
    id: 88,
    title: '问题，最多一百零二字（真的有人写那么多吗）',
    options: [
      { id: 1, text: '选项一：选项十八个字', votes: 12 },
      { id: 2, text: '选项二：最长十八字', votes: 7 },
    ],
    is_author: false,
    created_minutes_ago: 10,
    recycle_hours: 3,               
  },
  {
    id: 89,
    title: '赶海时捡到一只会说话的海螺，你会怎么办？',
    options: [
      { id: 1, text: '带回家养着', votes: 8 },
      { id: 2, text: '放回海里', votes: 15 },
      { id: 3, text: '送给朋友', votes: 3 },
    ],
    is_author: false,
    created_minutes_ago: 120,
    recycle_hours: 6,              
  },
  {
    id: 90,
    title: '你觉得声音该不该有颜色？',
    options: [
      { id: 1, text: '该有，看得见才记得住', votes: 9 },
      { id: 2, text: '不该有，声音就是声音', votes: 11 },
      { id: 3, text: '无所谓，好听就行', votes: 6 },
      { id: 4, text: '希望有，但别太吵', votes: 4 },
    ],
    is_author: false,
    created_minutes_ago: 300,
    recycle_hours: 24,              
  },
  {
    id: 91,
    title: '如果只能保留一段记忆，你会留哪一段？',
    options: [
      { id: 1, text: '最快乐的那段', votes: 21 },
      { id: 2, text: '最痛苦的那段', votes: 4 },
      { id: 3, text: '最普通的一天', votes: 13 },
    ],
    is_author: false,
    created_minutes_ago: 1440,
    recycle_hours: 72,              
  },
  {
    id: 92,
    title: '深夜的情绪和白天相比，哪个更需要被安慰？',
    options: [
      { id: 1, text: '深夜，因为没人看见', votes: 17 },
      { id: 2, text: '白天，因为要装作没事', votes: 14 },
    ],
    is_author: false,
    created_minutes_ago: 1080,
    recycle_hours: 168,             
  },
  {
    id: 93,
    title: '你愿意花多久等一个可能没有结果的问题？',
    options: [
      { id: 1, text: '一分钟都等不了', votes: 10 },
      { id: 2, text: '等到这周结束', votes: 18 },
      { id: 3, text: '等到忘记为止', votes: 7 },
      { id: 4, text: '一直等，等到有答案', votes: 5 },
    ],
    is_author: false,
    created_minutes_ago: 25,
    recycle_hours: 48,              
  },
]


const QUESTION_RUNTIME: Record<number, AnswerQuestion> = {}

function buildQuestion(seed: QuestionSeed): AnswerQuestion {
  const created = new Date(Date.now() - seed.created_minutes_ago * 60000).toISOString()
  const expire = new Date(
    new Date(created).getTime() + seed.recycle_hours * 3600000,
  ).toISOString()

  return {
    id: seed.id,
    title: seed.title,
    options: seed.options.map((o) => ({ ...o })),
    created_at: created,
    expires_at: expire,
    exp: getMe().exp,
    is_author: seed.is_author,
  }
}

let current: AnswerQuestion | null = null

function clone(q: AnswerQuestion): AnswerQuestion {
  return { ...q, options: q.options.map((o) => ({ ...o })) }
}


// 随机抽一道：连续抽到同一道的话顺延一个，免得看起来像没随机
export function getQuestion(): Promise<AnswerQuestion> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let index = Math.floor(Math.random() * QUESTION_POOL.length)
      const seed = QUESTION_POOL[index]
      if (QUESTION_POOL.length > 1 && current && seed.id === current.id) {
        index = (index + 1) % QUESTION_POOL.length
      }

      const picked = QUESTION_POOL[index]
      let question = QUESTION_RUNTIME[picked.id]
      if (!question) {
        question = buildQuestion(picked)
        QUESTION_RUNTIME[picked.id] = question
      }
      question.exp = getMe().exp   
      current = question
      resolve(clone(question))
    }, 300)
  })
}

export function submitVote(optionId: number): Promise<AnswerQuestion> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!current) {
        reject(new Error('题目还没加载好'))
        return
      }
      const target = current.options.find((o) => o.id === optionId)
      if (target) target.votes += 1

      // 答一题 +5 经验，并且要写回 mock_users，
      // 这样「我的」页、评论区等级、下次进来都是最新的
      const user = getCurrentUser()
      if (user) {
        const nextExp = user.exp + 5
        saveCurrentUser({ ...user, exp: nextExp })
        current.exp = nextExp
      }

      resolve(clone(current))
    }, 400)
  })
}

