export interface UserData {
	id: string
	username: string
	email: string
}

export type User = {
	token: string
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
	user: User | null
}
