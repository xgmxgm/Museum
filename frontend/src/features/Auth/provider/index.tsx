import { useState, type FC, type PropsWithChildren } from 'react'
import { AuthContext } from '../context'
import type { User } from '../type'
import axios from 'axios'
import { useNotificationContext } from '../../Notification/context'

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
	const { setNotification } = useNotificationContext()
	const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined)
	const [user, setUser] = useState<User | null>(null)

	const registerUserWithEmailAndPassword = async (
		email: string,
		password: string,
		setIsLoading: (IsLoading: boolean) => void,
	) => {
		setIsLoading(true)

		await axios
			.post('/signup', { email, password })
			.then(() => {
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

		await axios
			.post('/signin', { email, password })
			.then(() => {
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
		await axios.get('/logout').then(() => {
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
