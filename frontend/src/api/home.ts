import { get } from './request'
import { getDebates } from './debate'
import type { DebateItem } from './debate'

export interface DailyStats {
  questions_today: number
  votes_today: number
  settled_today: number
}

export interface HomeData {
  stats: DailyStats
  disputes: DebateItem[]
}

export async function getHomeData(): Promise<HomeData> {
  const [stats, debates] = await Promise.all([
    get<DailyStats>('/stats/daily'),
    getDebates(),
  ])

  return {
    stats,
    disputes: debates.list.slice(0, 4),
  }
}