import type { User } from '../type'
import { AuthContext } from '../context'
import { api } from '../../../shared/libs/axios'
import { useEffect, useState, type FC, type PropsWithChildren } from 'react'
import { useNotificationContext } from '../../Notification/context'

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const { setNotification } = useNotificationContext()
	const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined)
	const [user, setUser] = useState<User | null>(null)

	const saveSession = (data: { access_token: string; refresh_token: string; user: User['user'] }) => {
		localStorage.setItem('access_token', data.access_token)
		localStorage.setItem('refresh_token', data.refresh_token)
		localStorage.removeItem('token')
		setUser({ token: data.access_token, refreshToken: data.refresh_token, user: data.user })
		setIsAuth(true)
	}

	const registerUserWithEmailAndPassword = async (
		username: string,
		email: string,
		password: string,
		repeatPassword: string,
		setIsLoading: (IsLoading: boolean) => void,
	) => {
		if (password !== repeatPassword) {
			setNotification('passwords not equals')
			return
		}

		setIsLoading(true)

		await api
			.post('/auth/register', { username, email, password })
			.then(res => {
				saveSession(res.data)
				setNotification('successfullyRegister')
			})
			.catch(e => {
				console.log(e)
				setNotification(e.message)
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	const loginWithEmailAndPassword = async (
		email: string,
		password: string,
		setIsLoading: (IsLoading: boolean) => void,
	) => {
		setIsLoading(true)

		await api
			.post('/auth/login', { email, password })
			.then(res => {
				saveSession(res.data)
				setNotification('successfullyLogin')
			})
			.catch(e => {
				console.log(e)
				setNotification('Wrong email or password')
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	const clearSession = () => {
		setUser(null)
		setIsAuth(false)
		localStorage.removeItem('access_token')
		localStorage.removeItem('refresh_token')
		localStorage.removeItem('token')
	}

	const logout = async () => {
		const refreshToken = localStorage.getItem('refresh_token')
		try {
			if (refreshToken) await api.post('/auth/logout', { refresh_token: refreshToken })
		} catch (error) {
			console.warn('Logout request failed; clearing the local session.', error)
		} finally {
			clearSession()
			setNotification('successfullyLogout')
		}
	}

	const changePassword = async (oldPassword: string, newPassword: string) => {
		await api.patch('/users/me/password', { old_password: oldPassword, new_password: newPassword })
	}

	const deleteAccount = async () => {
		await api.delete('/users/me')
		clearSession()
	}

	useEffect(() => {
		const handleExpired = () => clearSession()
		window.addEventListener('museum:auth-expired', handleExpired)
		return () => window.removeEventListener('museum:auth-expired', handleExpired)
	}, [])

	useEffect(() => {
		const fetchUser = async () => {
			const accessToken = localStorage.getItem('access_token') || localStorage.getItem('token')
			const refreshToken = localStorage.getItem('refresh_token') || ''
			if (!accessToken) {
				setIsAuth(false)
				return
			}
			try {
				const res = await api.get('/users/me')
				setUser({
					token: localStorage.getItem('access_token') || accessToken,
					refreshToken: localStorage.getItem('refresh_token') || refreshToken,
					user: res.data,
				})
				setIsAuth(true)
			} catch (error) {
				console.error(error)
				if (!localStorage.getItem('access_token')) clearSession()
			}
		}
		fetchUser()
	}, [])

	return (
		<AuthContext.Provider
			value={{
				isAuth,
				user,
				loginWithEmailAndPassword,
				logout,
			changePassword,
			deleteAccount,
				registerUserWithEmailAndPassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
