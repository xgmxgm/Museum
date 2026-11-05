import { createBrowserRouter } from 'react-router'
import { Header } from '../../../widgets/header'
import { HomePage } from '../../../pages/Home'
import { AuthorizePage } from '../../../pages/Authorize'

export const router = createBrowserRouter([
	{
		index: true,
		path: '/',
		element: (
			<>
				<Header />
				<HomePage />
			</>
		),
	},
	{
		path: '/authorize',
		element: <AuthorizePage />,
	},
])
