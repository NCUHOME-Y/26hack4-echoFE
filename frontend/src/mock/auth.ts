export interface UserInfo {
  id: number
  account: string
  nickname: string
  avatar: string
  exp: number
  created_at: string
  updated_at: string
}

export interface MockUser extends UserInfo {
  password: string
}

// 登录成功返回{ token, user }
export interface LoginResult {
  token: string
  user: UserInfo
}

const USERS_KEY = 'mock_users'
const TOKEN_KEY = 'echo_token'

const ACCOUNT_RE = /^[a-zA-Z0-9]{3,64}$/
const PASSWORD_RE = /^[a-zA-Z0-9]{8,64}$/

//错误返回
const MSG_REGISTER_INVALID = '账号和昵称必填'
const MSG_LOGIN_INVALID = '账号和密码必填'
const MSG_PASSWORD_INVALID = '密码需为 8–64 位，密码只能包含大小写字母和数字'
const MSG_INVALID_CREDENTIALS = '账号或密码错误'
const MSG_ACCOUNT_TAKEN = '账号已被注册'
const MSG_NICKNAME_TOO_LONG = '昵称最多7个字'
const MSG_ACCOUNT_INVALID = '账号只能包含大小写字母和数字'



function readUsers(): MockUser[] {
  const text = localStorage.getItem(USERS_KEY)
  if (!text) return []
  try {
    return JSON.parse(text) as MockUser[]
  } catch {
    return []
  }
}

function saveUsers(users: MockUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

//延迟
function sleep(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 400)
  })
}

// token
function makeToken(id: number): string {
  return 'mock-token-' + id + '-' + Date.now()
}

// 时间字符串：2026-11-10T15:04:05+08:00 RFC3339带时区
function now(): string { 
  const d = new Date()
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n)
  return (
    d.getFullYear() +
    '-' + pad(d.getMonth() + 1) +
    '-' + pad(d.getDate()) +
    'T' + pad(d.getHours()) +
    ':' + pad(d.getMinutes()) +
    ':' + pad(d.getSeconds()) +
    '+08:00'
  )
}

// 返回页面用户信息
function toUserInfo(user: MockUser): UserInfo {
  return {
    id: user.id,
    account: user.account,
    nickname: user.nickname,
    exp: user.exp,
    avatar: user.avatar,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

// 测试账号
function ensureDemoUser(): void {
  if (readUsers().length > 0) return
  const time = now()
  saveUsers([
    {
      id: 1,
      account: 'demo',
      nickname: '演示用户',
      avatar: '',
      exp: 628,
      created_at: time,
      updated_at: time,
      password: 'demo12345',
    },
  ])
}

// 登录（对应 POST /api/auth/login，成功 200）
// 成功：返回 { token, user }
// 失败：throw Error，页面 catch 到以后显示 err.message
export async function login(account: string, password: string): Promise<LoginResult> {
  await sleep()
  ensureDemoUser()

  if (!account || !password) {
    throw new Error(MSG_LOGIN_INVALID)
  }

  const users = readUsers()
  const user = users.find((item) => item.account === account)

  // 账号不存在或密码不匹配，返回提示
  if (!user || user.password !== password) {
    throw new Error(MSG_INVALID_CREDENTIALS)
  }

  return { token: makeToken(user.id), user: toUserInfo(user) }
}


// 注册
// 成功：返回用户信息
// 失败：throw Error
export async function register(
  account: string,
  nickname: string,
  password: string,
): Promise<UserInfo> {
  await sleep()
  ensureDemoUser()

  if (!account || !nickname || !password) {
    throw new Error(MSG_REGISTER_INVALID)
  }
  if (nickname.length > 7) {
    throw new Error(MSG_NICKNAME_TOO_LONG)
  }
  if (ACCOUNT_RE.test(account) === false) {
    throw new Error(MSG_ACCOUNT_INVALID)
  }
  if (PASSWORD_RE.test(password) === false) {
    throw new Error(MSG_PASSWORD_INVALID)
  }

  const users = readUsers()
  const exists = users.some((item) => item.account === account)
  if (exists) {
    throw new Error(MSG_ACCOUNT_TAKEN)
  }

  // id 取现有最大id加一
  let nextId = 1
  for (const item of users) {
    if (item.id >= nextId) nextId = item.id + 1
  }

  const time = now()
  const newUser: MockUser = {
    id: nextId,
    account: account,
    nickname: nickname,
    avatar: '',
    exp: 0,
    created_at: time,
    updated_at: time,
    password: password,
  }
  users.push(newUser)
  saveUsers(users)

  return toUserInfo(newUser)
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

// —— 供「我的」页mock复用：按token找到当前登录用户 ——
export function getCurrentUser(): MockUser | null {
  const token = getToken()
  const match = token ? /^mock-token-(\d+)-/.exec(token) : null
  if (!match) return null
  const id = Number(match[1])
  return readUsers().find((item) => item.id === id) ?? null
}

//覆盖保存当前用户，mock里改头像/加经验都走这里
export function saveCurrentUser(user: MockUser): void {
  const users = readUsers()
  const index = users.findIndex((item) => item.id === user.id)
  if (index === -1) return
  users[index] = user
  saveUsers(users)
}