import type { User } from '../type'
import { AuthContext } from '../context'
import { api } from '../../../shared/libs/axios'
import { useEffect, useState, type FC, type PropsWithChildren } from 'react'
import { useNotificationContext } from '../../Notification/context'

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const { setNotification } = useNotificationContext()
	const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined)
	const [user, setUser] = useState<User | null>(null)

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
				localStorage.setItem('token', res.data.token)
				setUser(res.data)
				setIsAuth(true)
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
				localStorage.setItem('token', res.data.token)
				setUser(res.data)
				setIsAuth(true)
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

	const logout = async () => {
		await api.post('/auth/logout', {}).then(() => {
			setUser(null)
			setIsAuth(false)
			localStorage.removeItem('token')
		})
	}

	useEffect(() => {
		const fetchUser = async () => {
			const tokenFromLocalStorage = localStorage.getItem('token')

			if (tokenFromLocalStorage) {
				await api
					.get('/users/me')
					.then(res => {
						setUser({ user: res.data, token: tokenFromLocalStorage })
						setIsAuth(true)
						setNotification('successfullyLogin')
					})
					.catch(e => console.error(e))
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
				registerUserWithEmailAndPassword,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
