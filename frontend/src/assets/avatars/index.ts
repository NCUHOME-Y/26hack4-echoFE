import avatar1 from './avatar-1.svg'
import avatar2 from './avatar-2.svg'
import avatar3 from './avatar-3.svg'
import avatar4 from './avatar-4.svg'
import avatar5 from './avatar-5.svg'
import avatar6 from './avatar-6.svg'
import avatar7 from './avatar-7.svg'
import avatar8 from './avatar-8.svg'

// 和后端 avatar-1 ~ avatar-N 的格式保持一致
export const AVATAR_IDS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
  'avatar-8',
] as const

export type AvatarId = (typeof AVATAR_IDS)[number]

//随便生成的八个注册默认头像
export const DEFAULT_AVATAR: AvatarId = 'avatar-1'

const AVATAR_MAP: Record<string, string> = {
  'avatar-1': avatar1,
  'avatar-2': avatar2,
  'avatar-3': avatar3,
  'avatar-4': avatar4,
  'avatar-5': avatar5,
  'avatar-6': avatar6,
  'avatar-7': avatar7,
  'avatar-8': avatar8,
}

//脏数据/旧账号兜底 永远返回一张能显示的图
export function avatarUrl(avatar?: string | null): string {
  return AVATAR_MAP[avatar ?? ''] ?? AVATAR_MAP[DEFAULT_AVATAR]
}