export interface DisputeItem {
  id: number
  title: string
  summary: string
  replies: number
  created_at: string
}

export interface HomeData {
  checkinDays: number
  stats: { thrown: number; returned: number; picked: number }
  disputes: DisputeItem[]
}

const DISPUTES: DisputeItem[] = [
  {
    id: 1001,
    title: '考研还是先实习？',
    summary: '大三手上有个实习机会，但还想冲一次考研，时间只够做一件事。',
    replies: 12,
    created_at: '2026-11-14T09:12:00+08:00',
  },
  {
    id: 1002,
    title: '室友半夜打游戏该不该说？',
    summary: '已经提醒过两次，还是照旧，怕说了伤和气，不说又睡不着。',
    replies: 34,
    created_at: '2026-11-14T08:40:00+08:00',
  },
  {
    id: 1003,
    title: '该不该为了绩点放弃社团？',
    summary: '社团占掉每周十小时，绩点掉到年级中游，纠结要不要退。',
    replies: 7,
    created_at: '2026-11-13T22:05:00+08:00',
  },
  {
    id: 1004,
    title: '食堂涨价三块，能不能接受？',
    summary: '同一份套餐一个月内涨了三次，感觉只能自己带饭了。',
    replies: 51,
    created_at: '2026-11-13T19:30:00+08:00',
  },
  {
    id: 1005,
    title: '这条不该出现（第 5 条）',
    summary: '用来验证"最多四个"的截断，页面上不应该看到我。',
    replies: 0,
    created_at: '2026-11-13T18:00:00+08:00',
  },
]

// 只有进入页面时调用一次；不轮询、不监听，所以停留期间数字不会变
export function getHomeData(): Promise<HomeData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        checkinDays: 3,
        stats: { thrown: 123, returned: 87, picked: 41 },
        disputes: DISPUTES.slice(0, 4), // 最多四个
      })
    }, 500)
  })
}
