import { avatarUrl } from '../../assets/avatars'
import styles from './index.module.css'

interface AvatarProps {
  avatar?: string | null
  size?: number
  alt?: string
  className?: string
  /** circle 用于列表/卡片，square 用于头像选择弹窗 */
  shape?: 'circle' | 'square'
}

export default function Avatar({
  avatar,
  size = 48,
  alt = '头像',
  className,
  shape = 'circle',
}: AvatarProps) {
  const classNames = [styles.avatar, shape === 'square' ? styles.square : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <img
      className={classNames}
      src={avatarUrl(avatar)}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}