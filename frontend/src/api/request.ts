//所有请求的统一出口：带token、拆{code,msg,data}、统一报错
import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

//token的存储键，与登录页保持一致，都不能单独改
export const TOKEN_KEY = 'echo_token'

//后端统一响应外壳，与handler/response.go的Response对应
interface ApiResponse<T> {
  code: number
  msg: string
  data: T
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

//请求拦截：有token就自动带上，业务代码不用每次手写
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

//响应拦截只处理「网络层失败」：HTTP状态非2xx时才会进来
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 && !window.location.pathname.startsWith('/login')) {
      //token失效：清掉再回登录页，避免卡在空页面上
      localStorage.removeItem(TOKEN_KEY)
      window.location.assign('/login')
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    //后端统一返回里带着msg，前端不自己编文案
    const msg = (error.response?.data as { msg?: string })?.msg
    return Promise.reject(new Error(msg ?? '网络异常，请稍后重试'))
  },
)

//业务层统一入口：成功返回data，失败抛Error
async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await http.request<ApiResponse<T>>(config)
  const body = response.data
  //后端成功码是200和201
  if (body.code < 200 || body.code >= 300) {
    throw new Error(body.msg)
  }
  return body.data
}

export const get = <T>(url: string, params?: Record<string, unknown>) =>
  request<T>({ method: 'GET', url, params })

export const post = <T>(url: string, data?: unknown) =>
  request<T>({ method: 'POST', url, data })

export const patch = <T>(url: string, data?: unknown) =>
  request<T>({ method: 'PATCH', url, data })

export const del = <T>(url: string) => request<T>({ method: 'DELETE', url })