import { post, TOKEN_KEY } from './request'

//与后端model/user.go的User输出字段一一对应
export interface UserInfo {
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

export interface LoginResult {
  token: string
  user: UserInfo
}

export function login(account: string, password: string): Promise<LoginResult> {
  return post<LoginResult>('/auth/login', { account, password })
}

export function register(
  account: string,
  nickname: string,
  password: string,
): Promise<UserInfo> {
  return post<UserInfo>('/auth/register', { account, nickname, password })
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}