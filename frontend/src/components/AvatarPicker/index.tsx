// 头像选择弹窗：正方形预览、左右轮换、确定后回调
import { useEffect, useState } from 'react'
import { AVATAR_IDS } from '../../assets/avatars'
import Avatar from '../Avatar'
import styles from './index.module.css'

interface AvatarPickerProps {
  open: boolean
  value?: string | null
  onClose: () => void
  onConfirm: (avatar: string) => Promise<void> | void
}

export default function AvatarPicker({ open, value, onClose, onConfirm }: AvatarPickerProps) {
  const [index, setIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // 每次打开时从当前头像开始
  useEffect(() => {
    if (!open) return
    const currentIndex = AVATAR_IDS.findIndex((id) => id === value)
    setIndex(currentIndex === -1 ? 0 : currentIndex)
    setSaving(false)
    setError('')
  }, [open, value])

  // Esc 关闭，← → 轮换
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') {
        setIndex((prev) => (prev + AVATAR_IDS.length - 1) % AVATAR_IDS.length)
      }
      if (event.key === 'ArrowRight') {
        setIndex((prev) => (prev + 1) % AVATAR_IDS.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  const current = AVATAR_IDS[index]

  const handleConfirm = async () => {
    setSaving(true)
    setError('')
    try {
      await onConfirm(current)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
      setSaving(false)
    }
  }

  return (
    <div className={styles.mask} role="presentation" onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="选择头像"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className={styles.title}>选择头像</h2>

        <div className={styles.stage}>
          <button
            type="button"
            className={styles.arrow}
            aria-label="上一个头像"
            onClick={() =>
              setIndex((prev) => (prev + AVATAR_IDS.length - 1) % AVATAR_IDS.length)
            }
          >
            ‹
          </button>
          <Avatar
            avatar={current}
            size={200}
            shape="square"
            className={styles.preview}
            alt="当前选择的头像"
          />
          <button
            type="button"
            className={styles.arrow}
            aria-label="下一个头像"
            onClick={() => setIndex((prev) => (prev + 1) % AVATAR_IDS.length)}
          >
            ›
          </button>
        </div>

        <div className={styles.dots} aria-hidden="true">
          {AVATAR_IDS.map((id, dotIndex) => (
            <span
              key={id}
              className={dotIndex === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
            />
          ))}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={saving}>
            取消
          </button>
          <button type="button" className={styles.confirm} onClick={handleConfirm} disabled={saving}>
            {saving ? '保存中…' : '确定'}
          </button>
        </div>
      </div>
    </div>
  )
}