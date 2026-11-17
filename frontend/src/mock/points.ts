// 积分的 mock：GET /api/users/me/points
// 规则：答题者选中的选项 == 发布者最终公布的选择 → 猜中，加分
// 每条海螺只加一次，重复进页面/刷新都不会重复加（用 localStorage 记住已加过的海螺 id）

export const MATCH_POINTS = 10

const POINTS_KEY = 'echo.mockedPoints'
const AWARDED_KEY = 'echo.mockedAwardedQuestionIds'

interface PointStore {
  total: number
  awarded: number[]
}

function readStore(): PointStore {
  try {
    const total = Number(localStorage.getItem(POINTS_KEY) ?? '0')
    const awarded = JSON.parse(localStorage.getItem(AWARDED_KEY) ?? '[]') as unknown
    return {
      total: Number.isFinite(total) ? total : 0,
      awarded: Array.isArray(awarded) ? (awarded as number[]) : [],
    }
  } catch {
    return { total: 0, awarded: [] }
  }
}

function writeStore(store: PointStore): void {
  try {
    localStorage.setItem(POINTS_KEY, String(store.total))
    localStorage.setItem(AWARDED_KEY, JSON.stringify(store.awarded))
  } catch {
    // 浏览器禁用存储时退化成「本次会话内存里记着」，不影响页面
  }
}

// 当前积分
export function getPoints(): number {
  return readStore().total
}

// 这条海螺是不是已经加过分了
export function hasAwarded(questionId: number): boolean {
  return readStore().awarded.includes(questionId)
}

// 猜中时调用：第一次返回加分值，之后返回 0（幂等）
export function awardMatchPoints(questionId: number, matched: boolean): number {
  if (!matched) return 0
  const store = readStore()
  if (store.awarded.includes(questionId)) return 0
  store.awarded = [...store.awarded, questionId]
  store.total += MATCH_POINTS
  writeStore(store)
  return MATCH_POINTS
}
