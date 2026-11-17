import {del,get,post,put } from './request'

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

export function getRandomQuestion(): Promise<QuestionDetail | null> {
  return get<QuestionDetail | null>('/questions/random')
}

export interface VoteResult {
  question_id: number
  option_id: number
  total_votes: number
  options: QuestionOption[]
}

export function submitVote(
  questionId: number,
  optionId: number,
): Promise<VoteResult> {
  return post<VoteResult>(`/questions/${questionId}/votes`, {
    option_id: optionId,
  })
}

export const COMMENT_MAX_LEN = 32

export interface CommentView {
  id: number
  content: string
  created_at: string
  is_mine: boolean
  author: QuestionAsker
}

interface CommentListResult {
  list: CommentView[]
  returned: number
  total: number
}

interface DeleteCommentResult {
  id: number
  deleted: boolean
}

export async function getComments(
  questionId: number,
): Promise<CommentView[]> {
  const data = await get<CommentListResult>(
    `/questions/${questionId}/replies`,
  )
  return data.list
}

export async function addComment(
  questionId: number,
  content: string,
): Promise<CommentView[]> {
  await post<CommentView>(`/questions/${questionId}/replies`, {
    content: content.trim(),
  })
  return getComments(questionId)
}

export async function deleteComment(
  questionId: number,
  commentId: number,
): Promise<CommentView[]> {
  await del<DeleteCommentResult>(`/replies/${commentId}`)
  return getComments(questionId)
}

export function getQuestionDetail(
  questionId: number,
): Promise<QuestionDetail> {
  return get<QuestionDetail>(`/questions/${questionId}`)
}
export interface FinalResult {
  question_id: number
  final_option_id: number
}

export async function settleQuestion(
  questionId: number,
  optionId: number,
): Promise<QuestionDetail> {
  await put<FinalResult>(`/questions/${questionId}/final`, {
    option_id: optionId,
  })

  //PUT只返回题目和选项ID，重新获取完整的已结算详情
  return getQuestionDetail(questionId)
}