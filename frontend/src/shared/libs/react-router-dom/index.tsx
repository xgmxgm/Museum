import { createBrowserRouter } from 'react-router'
import { Header } from '../../../widgets/header'
import { HomePage } from '../../../pages/Home'
import { AuthorizePage } from '../../../pages/Authorize'
import { Footer } from '../../../widgets/footer'
import { MuseumPage } from '../../../pages/Museum'

export const router = createBrowserRouter([
	{
		index: true,
		path: '/',
		element: (
			<>
				<Header />
				<HomePage />
				<Footer />
			</>
		),
	},
	{
		path: '/authorize',
		element: (
			<>
				<Header />
				<AuthorizePage />
			</>
		),
	},
	{
		path: '/museum/:id',
		element: (
			<>
				<Header />
				<MuseumPage />
			</>
		),
	},
])
