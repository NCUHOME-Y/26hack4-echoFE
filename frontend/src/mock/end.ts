// 结算页的 mock：GET /api/questions/{id}/settle 与 POST …/settle
// 票数与 mock/myQuestions.ts 里的 total_votes 保持一致

export interface SettleOption {
  id: number
  text: string
  votes: number
}

export interface SettleQuestion {
  id: number
  description: string
  options: SettleOption[]
  total_votes: number
  expires_at: string
  // 发问者最终公布的选择；null = 还没收回
  picked_option_id: number | null
  settled_at: string | null
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function build(
  id: number,
  description: string,
  votes: number[],
  texts: string[],
  expiresHoursAgo: number,
): SettleQuestion {
  const options: SettleOption[] = votes.map((v, i) => ({
    id: id * 10 + i + 1,
    text: texts[i] ?? `选项${i + 1}`,
    votes: v,
  }))
  return {
    id,
    description,
    options,
    total_votes: options.reduce((sum, o) => sum + o.votes, 0),
    expires_at: hoursAgo(expiresHoursAgo),
    picked_option_id: null,
    settled_at: null,
  }
}

const STORE: Record<number, SettleQuestion> = {
  201: build(201, '周末去图书馆还是在家赶作业', [7, 5], ['去图书馆', '在家赶作业'], -5),
  202: build(202, '换新手机还是攒钱换电脑', [3, 3, 2], ['换新手机', '攒钱换电脑', '两个都再等等'], -20),
  203: build(203, '水杯买粉色还是蓝色', [12, 10, 7, 5], ['粉色', '蓝色', '米白色', '看哪个便宜买哪个'], 2),
  204: build(204, '要不要为了合群参加不想去的聚会', [40, 36, 20], ['去，别扫兴', '不去，待着舒服', '看是谁组的局'], 6),
  205: build(205, '这条已结算 25 小时，应该看不到', [25, 15], ['立刻选', '再想想'], 25),
  206: build(206, '早上跑步还是晚上跑步', [14, 8], ['早上', '晚上'], 20),
  // 一条投票的都没有，而且已经截止：用来验证结算页的空态
  207: build(207, '还没人捡起这颗海螺：周五晚上要不要去看球', [0, 0], ['去看', '不去'], 3),
}

function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getSettleQuestion(id: number): Promise<SettleQuestion | null> {
  await sleep()
  const found = STORE[id]
  return found ? { ...found, options: found.options.map((o) => ({ ...o })) } : null
}

// 发问者公布最终选择，海螺就此收回
export async function settleQuestion(id: number, optionId: number | null): Promise<SettleQuestion> {
  await sleep(400)
  const found = STORE[id]
  if (!found) throw new Error('这只海螺已经不在海里了')
  if (optionId !== null && !found.options.some((o) => o.id === optionId)) {
    throw new Error('选中的选项不存在')
  }
  found.picked_option_id = optionId
  found.settled_at = new Date().toISOString()
  return { ...found, options: found.options.map((o) => ({ ...o })) }
}
