import type { User } from '../type'
import { AuthContext } from '../context'
import { api } from '../../../shared/libs/axios'
import { useState, type FC, type PropsWithChildren } from 'react'
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
				setUser(res.data)
				setIsAuth(true)
				setNotification('Successfully register')
			})
			.catch(e => {
				console.log('e: ', e)
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
				setUser(res.data)
				setIsAuth(true)
				setNotification('Successfully login')
			})
			.catch(e => {
				console.log('e: ', e)
				setNotification('Wrong email or password')
			})
			.finally(() => {
				setIsLoading(false)
			})
	}

	const logout = async () => {
		console.log('work')
		await api.get('/auth/logout').then(() => {
			setUser(null)
			setIsAuth(false)
		})
	}

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
