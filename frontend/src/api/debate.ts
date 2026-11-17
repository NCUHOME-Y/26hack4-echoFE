import { get } from './request'

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
  settled_at: string | null
  contested_at: string | null
  total_votes: number
  options: DebateOption[]
}

export interface DebateListResult {
  list: DebateItem[]
  returned: number
  total: number
}

export function getDebates(): Promise<DebateListResult> {
  return get<DebateListResult>('/questions/contested')
}