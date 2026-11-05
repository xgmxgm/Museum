import type { FC, PropsWithChildren } from 'react'
import { useAuthContext } from '../../context'
import { Navigate } from 'react-router'

interface IProtectedRoute {
	redirectPath?: string
}

export const ProtectedRoute: FC<PropsWithChildren<IProtectedRoute>> = ({
	children,
	redirectPath = '/authorize',
}) => {
	const { isAuth } = useAuthContext()

	if (!isAuth) {
		return <Navigate to={redirectPath} />
	}

	return children
}
