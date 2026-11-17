// 作答者结算页的 mock：GET /api/questions/{id}/answer-result
// 以「我的」页历史记录里的 101–108 为基础，字段和 mock/profile.ts 的 AnswerItem 对齐

export interface AnswerEndOption {
  id: number
  text: string
  votes: number
}

export interface AnswerEndQuestion {
  id: number
  description: string
  options: AnswerEndOption[]
  total_votes: number
  // 我投的那一项
  my_option_id: number
  // 提问者最终公布的选择；null = 还没收回，或收回时没选
  final_option_id: number | null
  expires_at: string
  settled_at: string | null
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function build(
  id: number,
  description: string,
  texts: string[],
  votes: number[],
  myIndex: number,
  finalIndex: number | null,
  settledHoursAgo: number | null,
  expiresHoursAgo: number,
): AnswerEndQuestion {
  const options: AnswerEndOption[] = texts.map((text, i) => ({
    id: i + 1,
    text,
    votes: votes[i] ?? 0,
  }))
  return {
    id,
    description,
    options,
    total_votes: options.reduce((sum, o) => sum + o.votes, 0),
    my_option_id: myIndex + 1,
    final_option_id: finalIndex === null ? null : finalIndex + 1,
    expires_at: hoursAgo(expiresHoursAgo),
    settled_at: settledHoursAgo === null ? null : hoursAgo(settledHoursAgo),
  }
}

const STORE: Record<number, AnswerEndQuestion> = {
  101: build(
    101,
    '测试一下打很多字的情况1234567890123456789012345678901234567890周末去图书馆还是在家赶作业',
    ['去图书馆', '在家赶作业'],
    [7, 5],
    0,
    0,
    1,
    2,
  ),
  // 还没收回：看不到最终选择
  102: build(102, '换新手机还是攒钱换电脑', ['换新手机', '攒钱换电脑'], [6, 4], 1, null, null, -3),
  103: build(
    103,
    '我该逃掉重要的专业课去看演唱会吗',
    ['不逃课', '逃课去演唱会'],
    [4, 9],
    0,
    1,
    20,
    1,
  ),
  // 已收回，但提问者没做选择
  104: build(104, '水杯买粉色还是蓝色', ['粉色', '蓝色'], [6, 4], 0, null, 48, 2),
  105: build(
    105,
    '要不要为了买衣服省吃俭用一周',
    ['省吃俭用一周', '不要省'],
    [5, 11],
    1,
    1,
    60,
    2,
  ),
  106: build(106, '这个手机该不该换', ['该换', '先不换'], [8, 3], 0, null, 90, 3),
  107: build(
    107,
    '朋友说的话总伤到我，是我敏感了吗',
    ['是我太敏感了', '不是敏感'],
    [3, 10],
    1,
    1,
    110,
    2,
  ),
  108: build(108, '早上跑步还是晚上跑步', ['早上', '晚上'], [9, 5], 1, null, null, 1),
}

function sleep(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getAnswerEndQuestion(id: number): Promise<AnswerEndQuestion | null> {
  await sleep()
  const found = STORE[id]
  return found ? { ...found, options: found.options.map((o) => ({ ...o })) } : null
}
