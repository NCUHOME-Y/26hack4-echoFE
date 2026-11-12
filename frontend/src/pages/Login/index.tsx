//登录页
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Login.module.css'
import { login, setToken } from '../../mock/auth'

export default function Login() {
  const navigate = useNavigate()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [hint, setHint] = useState('')
  const [submitting, setSubmitting] = useState(false)


  const isEmpty = !account.trim() || !password

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return

    const acc = account.trim()
    if (!acc) {
      setError('请填写账号')
      return
    }
    if (!password) {
      setError('请填写密码')
      return
    }

    setError('')
    setHint('')
    setSubmitting(true)
    try {
      const { token, user } = await login(acc, password)
      setToken(token)
      setHint(`登录成功，欢迎回来 ${user.nickname}`)
      sessionStorage.setItem('echo_nickname', user.nickname)
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
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
            aria-selected="true"
            className={`${styles.segBtn} ${styles.segBtnActive}`}
            onClick={() => {
              setError('')
              setHint('')
            }}
          >
            登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected="false"
            className={styles.segBtn}
            onClick={() => navigate('/register',)}
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
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={64}
              enterKeyHint="go"
              aria-label="密码"
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
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>
      </section>
    </div>
  )
}
