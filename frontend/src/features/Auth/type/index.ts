export interface UserData {
	id: string
	username: string
	email: string
	role: string
}

export type User = {
	token: string
	refreshToken: string
	user: UserData
}

export interface IAuthContext {
	isAuth: boolean | undefined
	loginWithEmailAndPassword: (
		email: string,
		password: string,
		setIsLoading: (isLoading: boolean) => void,
	) => void
	registerUserWithEmailAndPassword: (
		username: string,
		email: string,
		password: string,
		repeatPassword: string,
		setIsLoading: (isLoading: boolean) => void,
	) => void
	logout: () => void
	changePassword: (oldPassword: string, newPassword: string) => Promise<void>
	deleteAccount: () => Promise<void>
	user: User | null
}
