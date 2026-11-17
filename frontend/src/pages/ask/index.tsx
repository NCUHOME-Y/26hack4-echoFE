// 丢出海螺
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'
import timeIcon from '../../assets/brand/time.png'
import {
  QUESTION_MAX_LEN,
  OPTION_MAX_LEN,
  MIN_OPTIONS,
  MAX_OPTIONS,
  SETTLE_HOURS,
  LENGTH_ERROR,
  DUPLICATE_ERROR,
  settleLabel,
  loadDraft,
  saveDraft,
  clearDraft,
} from '../../mock/ask'
import { publishQuestion } from '../../api/question'
const LETTERS = ['A', 'B', 'C', 'D']

export default function Ask() {
  const navigate = useNavigate()

  // 一开始就把草稿读出来做初始值：不能放在 useEffect 里，
  // 否则下面的「自动保存」会先拿空值把 localStorage 覆盖掉
  const [draftInit] = useState(() => loadDraft())
  const [question, setQuestion] = useState(draftInit?.question ?? '')
  const [options, setOptions] = useState<string[]>(draftInit?.options ?? ['', '', ''])
  const [settleHours, setSettleHours] = useState<number>(
    draftInit?.settleHours ?? SETTLE_HOURS[0],
  )
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(
    Boolean(draftInit && (draftInit.question.trim() || draftInit.options.some((o) => o.trim()))),
  )
  const [published, setPublished] = useState(false)

  useEffect(() => {
    saveDraft({ question, options, settleHours })
  }, [question, options, settleHours])

  const questionTooLong = question.length > QUESTION_MAX_LEN
  const optionTooLong = options.some((o) => o.length > OPTION_MAX_LEN)
  const overLong = questionTooLong || optionTooLong

  // 填好的选项里有内容完全一样的
  const filledOptions = options.map((o) => o.trim()).filter(Boolean)
  const duplicated = new Set(filledOptions).size !== filledOptions.length

  const canSubmit = useMemo(() => {
    if (!question.trim()) return false
    if (overLong || duplicated) return false
    if (filledOptions.length < MIN_OPTIONS || filledOptions.length > MAX_OPTIONS) return false
    return true
  }, [question, overLong, duplicated, filledOptions.length])

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)))
    setError('')
  }

  function addOption() {
    if (options.length >= MAX_OPTIONS) return
    setOptions((prev) => [...prev, ''])
  }

  function removeOption(index: number) {
    if (options.length <= MIN_OPTIONS) return
    setOptions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handlePublish() {
    if (submitting || !canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      await publishQuestion({ question, options, settleHours })
      clearDraft()
      setPublished(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败，再试一次')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate('/home')}
          aria-label="返回"
        >
          ←
        </button>
        <h1 className={styles.title}>丢出海螺</h1>
      </header>

      <div className={styles.dashLine} />

      <div className={styles.body}>
        {restored && (
          <p className={styles.draftTip}>已经帮你接着上次的草稿写了</p>
        )}

        {/* 问题 */}
        <section className={styles.qCard}>
          <textarea
            className={styles.qInput}
            value={question}
            placeholder="简单描述你的纠结问题"
            onChange={(e) => {
              setQuestion(e.target.value)
              setError('')
              setRestored(false)
            }}
          />
          <div className={styles.qFoot}>
            {questionTooLong && <span className={styles.lenWarn}>{LENGTH_ERROR}</span>}
            <span
              className={[
                styles.counter,
                questionTooLong ? styles.counterOver : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {question.length}/{QUESTION_MAX_LEN}
            </span>
          </div>
        </section>

        {/* 选项 */}
        <section className={styles.optPanel}>
          <h2 className={styles.optTitle}>选项</h2>

          <div className={styles.optList}>
            {options.map((o, index) => (
              <div key={index} className={styles.optRow}>
                <span className={styles.optLetter}>{LETTERS[index]}</span>
                <input
                  className={styles.optInput}
                  value={o}
                  placeholder={`选项最多${OPTION_MAX_LEN}字`}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                {options.length > MIN_OPTIONS && (
                  <button
                    type="button"
                    className={styles.optRemove}
                    onClick={() => removeOption(index)}
                    aria-label="删除这个选项"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.optFoot}>
            {optionTooLong && <span className={styles.lenWarn}>{LENGTH_ERROR}</span>}
            {!optionTooLong && duplicated && (
              <span className={styles.lenWarn}>{DUPLICATE_ERROR}</span>
            )}
            {options.length < MAX_OPTIONS && (
              <button type="button" className={styles.addOpt} onClick={addOption}>
                + 再加一个选项
              </button>
            )}
          </div>
        </section>

        {/* 结算倒计时 */}
        <div className={styles.settleWrap}>
          {pickerOpen && (
            <div className={styles.timePicker}>
              {SETTLE_HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={[
                    styles.timeChip,
                    settleHours === h ? styles.timeChipActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    setSettleHours(h)
                    setPickerOpen(false)
                  }}
                >
                  {h}小时
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={styles.settleBtn}
            onClick={() => setPickerOpen((open) => !open)}
          >
            <img className={styles.settleIcon} src={timeIcon} alt="" aria-hidden="true" />
            <span className={styles.settleLabel}>截止时间：</span>
            <span className={styles.settleValue}>{settleLabel(settleHours)}</span>
          </button>
        </div>
      </div>

      <footer className={styles.foot}>
        {error && <p className={styles.error}>{error}</p>}
        <button
          type="button"
          className={styles.submit}
          disabled={!canSubmit || submitting}
          onClick={handlePublish}
        >
          丢出海螺
        </button>
      </footer>

      {/* 发布成功：假装已经发出去了，提醒去海螺页结算 */}
      {published && (
        <div className={styles.modalMask}>
          <div className={styles.modalBox}>
            <p className={styles.modalTitle}>海螺已经丢出去了</p>
            <button
              type="button"
              className={styles.modalBtn}
              onClick={() => {
                setPublished(false)
                navigate('/home')
              }}
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
