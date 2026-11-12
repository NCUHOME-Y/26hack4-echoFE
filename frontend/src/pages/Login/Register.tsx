//注册页
import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './Login.module.css'
import { login, register, setToken } from '../../mock/auth'

// 账号3–64、昵称1–64、密码8–64且只能大小写字母和数字
const PASSWORD_RE = /^[a-zA-Z0-9]{8,64}$/

export interface RegisterProps {
  // 跳登录页
  onSwitchToLogin?: () => void
  // 注册后跳首页
  onSuccess?: (token: string, nickname: string) => void
}

export default function Register({ onSwitchToLogin, onSuccess }: RegisterProps) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isEmpty = !account.trim() || !password || !nickname.trim()

  const validate = (): string => {
    const acc = account.trim()
    const nick = nickname.trim()
    if (!acc) return '请填写账号'
    if (acc.length < 3 || acc.length > 64) return '账号长度需为 3–64 个字符'
    if (/\s/.test(acc)) return '账号不能包含空格'
    if (!password) return '请填写密码'
    if (!PASSWORD_RE.test(password)) return '密码需为 8–64 位，且只能包含大小写字母和数字'
    if (!nick) return '请填写昵称'
    if (nick.length > 64) return '昵称不超过 64 个字'
    return ''
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    const message = validate()
    if (message) {
      setError(message)
      return
    }

    const acc = account.trim()
    const nick = nickname.trim()

    // 注册后登录
    setError('')
    setHint('')
    setSubmitting(true)
    try {
      await register(acc, nick, password)
      const { token } = await login(acc, password)

      setToken(token)
      setHint('注册成功，已自动登录')
      onSuccess?.(token, nick)
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.quoteCard}>
        <h1 className={styles.title}>
          <span>为什么</span>
          <span>不问问神奇海螺呢</span>
        </h1>
      </div>

      <div className={styles.spacer} aria-hidden="true" />

      <section className={styles.card}>
        <div className={styles.seg} role="tablist" aria-label="登录或注册">
          <button
            type="button"
            role="tab"
            aria-selected="false"
            className={styles.segBtn}
            onClick={() => onSwitchToLogin?.()}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected="true"
            className={`${styles.segBtn} ${styles.segBtnActive}`}
            onClick={() => {
              setError('')
              setHint('')
            }}
          >
            注册
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <label className={styles.field}>
            <span className={styles.label}>账号</span>
            <input
              className={styles.input}
              type="text"
              value={account}
              disabled={submitting}
              onChange={(e) => setAccount(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={64}
              enterKeyHint="next"
              aria-label="账号"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>密码</span>
            <input
              className={styles.input}
              type="password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={64}
              enterKeyHint="next"
              aria-label="密码"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>昵称</span>
            <input
              className={styles.input}
              type="text"
              value={nickname}
              disabled={submitting}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="nickname"
              maxLength={64}
              enterKeyHint="go"
              aria-label="昵称"
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          {hint && <p className={styles.hint}>{hint}</p>}

          <button
            type="submit"
            className={isEmpty ? `${styles.submit} ${styles.submitIdle}` : styles.submit}
            disabled={submitting}
          >
            {submitting ? '注册中…' : '注册'}
          </button>
        </form>
      </section>
    </div>
  )
}
