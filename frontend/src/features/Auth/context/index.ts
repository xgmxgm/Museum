import { createContext, useContext } from 'react'
import type { IAuthContext } from '../type'

export const AuthContext = createContext<IAuthContext>({
	isAuth: false,
	registerUserWithEmailAndPassword: async () => await Promise.reject({}),
	loginWithEmailAndPassword: async () => await Promise.reject({}),
	logout: () => {},
	changePassword: async () => await Promise.reject({}),
	deleteAccount: async () => await Promise.reject({}),
	user: null,
})

export const useAuthContext = () => {
	return useContext<IAuthContext>(AuthContext)
}
