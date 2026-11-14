import { avatarUrl } from '../../assets/avatars'
import styles from './index.module.css'

interface AvatarProps {
  avatar?: string | null
  size?: number
  alt?: string
  className?: string
}

export default function Avatar({ avatar, size = 48, alt = '头像', className }: AvatarProps) {
  return (
    <img
      className={className ? `${styles.avatar} ${className}` : styles.avatar}
      src={avatarUrl(avatar)}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}