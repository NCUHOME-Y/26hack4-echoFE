// 提问（丢出海螺）的 mock 接口：
// 字数规则、结算时间选项、草稿的存取、发布（发布后先挂审核）
export const QUESTION_MAX_LEN = 100
export const OPTION_MAX_LEN = 18
export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 4
// 超字数统一提示这一句
export const LENGTH_ERROR = '小小的海螺装不下那么多话哦'
// 选项内容不能完全一样
export const DUPLICATE_ERROR = '几个选项不能一模一样哦'
// 供发布者选择的结算倒计时（小时）
export const SETTLE_HOURS = [1, 3, 6, 12, 24, 48] as const

export interface AskDraft {
  question: string
  options: string[]
  settleHours: number
}

export interface PublishedQuestion {
  id: number
  question: string
  options: string[]
  settle_hours: number
  created_at: string
  status: 'pending' | 'live' // pending = 还在审核；对发布者照样显示「已发布」
}

const DRAFT_KEY = 'echo:ask:draft'

// 中途退出保留草稿；下次进来接着写
export function loadDraft(): AskDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AskDraft>
    const saved = Array.isArray(parsed.options)
      ? parsed.options.map((o) => String(o ?? '')).slice(0, MAX_OPTIONS)
      : []
    const options = [...saved]
    while (options.length < MIN_OPTIONS) options.push('')
    const hours =
      typeof parsed.settleHours === 'number' &&
      (SETTLE_HOURS as readonly number[]).includes(parsed.settleHours)
        ? parsed.settleHours
        : SETTLE_HOURS[0]
    return {
      question: typeof parsed.question === 'string' ? parsed.question : '',
      options,
      settleHours: hours,
    }
  } catch {
    return null
  }
}

export function saveDraft(draft: AskDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // localStorage 不可用就算了，草稿只是体验优化
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // 同上
  }
}

export function settleLabel(hours: number): string {
  return `${hours}小时后`
}

// 已发布的海螺（mock 内存里留着，刷新页面就没了）
const PUBLISHED: PublishedQuestion[] = []
let publishSeq = 200

export function publishQuestion(draft: AskDraft): Promise<PublishedQuestion> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const question = draft.question.trim()
      const options = draft.options.map((o) => o.trim()).filter(Boolean)

      if (!question) {
        reject(new Error('先写一句你想问的话吧'))
        return
      }
      if (question.length > QUESTION_MAX_LEN) {
        reject(new Error(LENGTH_ERROR))
        return
      }
      if (options.length < MIN_OPTIONS || options.length > MAX_OPTIONS) {
        reject(new Error(`选项只能有 ${MIN_OPTIONS} 到 ${MAX_OPTIONS} 个`))
        return
      }
      if (options.some((o) => o.length > OPTION_MAX_LEN)) {
        reject(new Error(LENGTH_ERROR))
        return
      }
      // 两个选项写得一字不差是不允许的
      if (new Set(options).size !== options.length) {
        reject(new Error(DUPLICATE_ERROR))
        return
      }
      if (!(SETTLE_HOURS as readonly number[]).includes(draft.settleHours)) {
        reject(new Error('结算时间选得不对'))
        return
      }

      const item: PublishedQuestion = {
        id: ++publishSeq,
        question,
        options,
        settle_hours: draft.settleHours,
        created_at: new Date().toISOString(),
        // 先挂审核：发布者看到的是「已发布」，别人那边只展示 live 的
        status: 'pending',
      }
      PUBLISHED.push(item)
      clearDraft()
      resolve(item)
    }, 500)
  })
}
