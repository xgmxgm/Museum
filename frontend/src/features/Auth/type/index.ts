export type User = {
	id: number
	email: string
	firstName: string
	lastName: string
}

export interface IAuthContext {
	isAuth: boolean | undefined
	loginWithEmailAndPassword: (
		email: string,
		password: string,
		setIsLoading: (isLoading: boolean) => void,
	) => void
	registerUserWithEmailAndPassword: (
		email: string,
		password: string,
		setIsLoading: (isLoading: boolean) => void,
	) => void
	logout: (setIsLoading: (isLoading: boolean) => void) => void
	user: User | null
}
