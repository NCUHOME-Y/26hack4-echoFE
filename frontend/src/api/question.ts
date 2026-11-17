import { post } from './request'

export interface QuestionOption {
  id: number
  label: string
  sort_no: number
  votes: number
  percent: number
}

export interface QuestionAsker {
  id: number
  nickname: string
  avatar: string
  level: number
}

export interface MyVote {
  option_id: number
  created_at: string
}

export interface QuestionDetail {
  id: number
  description: string
  status: 'open' | 'closed'
  expires_at: string
  created_at: string
  settled_at: string | null
  contested_at: string | null
  final_option_id: number | null
  option_count: number
  total_votes: number
  can_vote: boolean
  my_vote: MyVote | null
  asker: QuestionAsker
  options: QuestionOption[]
}

export interface PublishQuestionInput {
  question: string
  options: string[]
  settleHours: number
}

export function publishQuestion(
  draft: PublishQuestionInput,
): Promise<QuestionDetail> {
  const labels = draft.options.map((option) => option.trim()).filter(Boolean)

  return post<QuestionDetail>('/questions', {
    description: draft.question.trim(),
    options: labels.map((label) => ({ label })),
    duration_hours: draft.settleHours,
  })
}
