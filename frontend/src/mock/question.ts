import { DEFAULT_AVATAR, avatarUrl } from '../assets/avatars'
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

// ================= 评论区 =================
export const COMMENT_MAX_LEN = 32     // 单条评论最多 32 个字
export const MAX_COMMENTS = 50        // 一个海螺下最多留 50 条
export const MAX_PER_USER = 5         // 每个人最多发 5 条（发问者不限）

export interface AnswerComment {
  id: number
  question_id: number
  content: string
  created_at: string
  status: 'pending' | 'live'   // pending = 审核中，别人还看不到
  is_author: boolean           // 这条是不是发问者写的
  mine: boolean                // 这条是不是当前用户写的
  exp: number                  // 写评论那一刻作者的经验，用来算等级
  avatar: string               // 头像由后端给；没有头像的用户后端发默认头像
}

// 页面拿到的是"加工过"的评论：多算了一个当前等级
export interface CommentView extends AnswerComment {
  level: number
}

let commentSeq = 100

// 专门留一只「没有评论」的海螺，用来验证评论区空态；改这个数字就能换题
export const EMPTY_COMMENT_QUESTION_ID = 93

// 每道题下面预置几条评论（一条是发问者的）
function createSeedComments(questionId: number): AnswerComment[] {
  // 这一道题故意不给评论：投票后评论区应该显示「这只海螺期待听到你的想法」
  if (questionId === EMPTY_COMMENT_QUESTION_ID) return []
  const now = Date.now()
  return [
    {
      id: ++commentSeq,
      question_id: questionId,
      content: '这只海螺我捡起来又放下了',
      created_at: new Date(now - 40 * 60000).toISOString(),
      status: 'live',
      is_author: true,
      mine: false,
      exp: 628,
      avatar: avatarUrl('avatar-3'),
    },
    {
      id: ++commentSeq,
      question_id: questionId,
      content: '选第二个，经历过就懂了',
      created_at: new Date(now - 70 * 60000).toISOString(),
      status: 'live',
      is_author: false,
      mine: false,
      exp: 156,
      avatar: avatarUrl('avatar-5'),
    },
    {
      id: ++commentSeq,
      question_id: questionId,
      content: '原来不止我一个人在想这个',
      created_at: new Date(now - 130 * 60000).toISOString(),
      status: 'live',
      is_author: false,
      mine: false,
      exp: 43,
      avatar: avatarUrl('avatar-7'),
    },
  ]
}

const COMMENT_STORE: Record<number, AnswerComment[]> = {}

function commentsOf(questionId: number): AnswerComment[] {
  if (!COMMENT_STORE[questionId]) {
    COMMENT_STORE[questionId] = createSeedComments(questionId)
  }
  return COMMENT_STORE[questionId]
}

// 排序：发问者的评论永远在最上面；同组里越新越靠前
function toView(list: AnswerComment[]): CommentView[] {
  return list
    .map((c) => {
      // 自己的评论用当前经验和头像，升级/换头像后显示会跟着变
      if (c.mine) {
        const me = getMe()
        return { ...c, exp: me.exp, avatar: avatarUrl(me.avatar), level: levelInfo(me.exp).level }
      }
      return { ...c, level: levelInfo(c.exp).level }
    })
    .sort((a, b) => {
      if (a.is_author !== b.is_author) return a.is_author ? -1 : 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}

// 进入评论区取一次快照：只拿一次，之后不实时同步别人的新增/删除
export function getComments(questionId: number): Promise<CommentView[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(toView(commentsOf(questionId)))
    }, 300)
  })
}

export function addComment(questionId: number, content: string): Promise<CommentView[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const text = content.trim()
      if (!text) {
        reject(new Error('说点什么再发'))
        return
      }
      if (text.length > COMMENT_MAX_LEN) {
        reject(new Error(`最多 ${COMMENT_MAX_LEN} 个字`))
        return
      }

      const list = commentsOf(questionId)
      const question = QUESTION_RUNTIME[questionId]
      const isAuthor = question ? question.is_author : false

      if (!isAuthor) {
        const mineCount = list.filter((c) => c.mine).length
        if (mineCount >= MAX_PER_USER) {
          reject(new Error(`每个人最多只能发 ${MAX_PER_USER} 条`))
          return
        }
      }

      list.push({
        id: ++commentSeq,
        question_id: questionId,
        content: text,
        created_at: new Date().toISOString(),
        status: 'pending',   // 先挂审核，别人暂时看不到（自己看得到并标「审核中」）
        is_author: isAuthor,
        mine: true,
        exp: getMe().exp,
        // 头像走后端：没设头像的用户后端给默认头像，这里用 avatarUrl 兜底
        avatar: avatarUrl(getMe().avatar),
      })

      // 超过 50 条，把最早那条裁掉
      if (list.length > MAX_COMMENTS) {
        const oldest = list.reduce(
          (minIndex, c, i, arr) =>
            new Date(c.created_at).getTime() < new Date(arr[minIndex].created_at).getTime()
              ? i
              : minIndex,
          0,
        )
        list.splice(oldest, 1)
      }

      resolve(toView(list))
    }, 300)
  })
}

export function deleteComment(questionId: number, commentId: number): Promise<CommentView[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const list = commentsOf(questionId)
      const target = list.find((c) => c.id === commentId)
      if (!target) {
        reject(new Error('这条评论已经不在了'))
        return
      }

      const question = QUESTION_RUNTIME[questionId]
      const isAuthor = question ? question.is_author : false

      // 只能删自己的；发问者可以删自己问题下的所有
      if (!target.mine && !isAuthor) {
        reject(new Error('只能删自己的评论'))
        return
      }

      list.splice(list.indexOf(target), 1)
      resolve(toView(list))
    }, 250)
  })
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
      {id: 1, text: '1', votes: 4},
      {id: 2, text: '2', votes: 5},
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


// 已经推送过的题目 id：这次进页面后不再重复推送
const USED_IDS: number[] = []

// 从没推送过的题里随机抽一道；全部推送完就返回 null
export function getQuestion(): Promise<AnswerQuestion | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const left = QUESTION_POOL.filter((seed) => !USED_IDS.includes(seed.id))

      // 题库里一道没剩的了
      if (left.length === 0) {
        current = null
        resolve(null)
        return
      }

      const picked = left[Math.floor(Math.random() * left.length)]
      USED_IDS.push(picked.id)

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

