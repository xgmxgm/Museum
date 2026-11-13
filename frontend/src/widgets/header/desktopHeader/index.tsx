import { useEffect, type FC } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../../shared/ui/Logo'
import { Select } from '../../../shared/ui/Select'
import { useAuthContext } from '../../../features/Auth/context'

export const DesktopHeader: FC = () => {
	const { isAuth, user } = useAuthContext()

	const { t, i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	useEffect(() => {
		console.log('user: ', user)
	})

	return (
		<div className='w-full flex items-center justify-center fixed top-3 z-10'>
			<div className='p-7 rounded-lg w-11/12 flex items-center justify-between glass-effect'>
				<Link to='/'>
					<Logo />
				</Link>
				<div className='flex gap-5 justify-center items-center'>
					{isAuth ? (
						user?.user.username
					) : (
						<Link to={{ pathname: '/Authorize' }}>{t('signIn')}</Link>
					)}
					<Select
						defaultValue='kz'
						onChange={e => changeLanguage(e.target.value)}
						options={[
							{ value: 'kz', label: 'KZ' },
							{ value: 'ru', label: 'RU', selected: true },
						]}
					/>
				</div>
			</div>
		</div>
	)
}
