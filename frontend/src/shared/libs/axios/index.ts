import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

export const api = axios.create({
	baseURL: `${import.meta.env.VITE_API ?? ''}/api/`,
})

api.interceptors.request.use(
	config => {
		const token = localStorage.getItem('access_token') || localStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	error => {
		return Promise.reject(error)
	},
)

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }
let refreshPromise: Promise<string> | null = null

api.interceptors.response.use(response => response, async (error: AxiosError) => {
	const config = error.config as RetriableConfig | undefined
	const refreshToken = localStorage.getItem('refresh_token')
	if (error.response?.status !== 401 || !config || config._retry || !refreshToken || config.url?.includes('/auth/refresh')) {
		return Promise.reject(error)
	}
	config._retry = true
	try {
		if (!refreshPromise) {
			refreshPromise = axios.post(`${api.defaults.baseURL}auth/refresh`, { refresh_token: refreshToken })
				.then(response => {
					localStorage.setItem('access_token', response.data.access_token)
					localStorage.setItem('refresh_token', response.data.refresh_token)
					return response.data.access_token as string
				})
				.finally(() => { refreshPromise = null })
		}
		const accessToken = await refreshPromise
		config.headers.Authorization = `Bearer ${accessToken}`
		return api(config)
	} catch (refreshError) {
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('token')
		window.dispatchEvent(new Event('museum:auth-expired'))
		return Promise.reject(refreshError)
	}
})
