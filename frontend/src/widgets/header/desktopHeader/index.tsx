import { Select } from 'antd'
import type { FC } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../../shared/ui/Logo'

export const DesktopHeader: FC = () => {
	const { t, i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	return (
		<div className='w-full flex items-center justify-center fixed top-3'>
			<div className='p-7 rounded-lg w-10/12 flex items-center justify-between glass-effect'>
				<Link to='/'>
					<Logo />
				</Link>
				<div className='flex gap-5 justify-center items-center'>
					<Link to={{ pathname: '/Authorize' }}>{t('signIn')}</Link>
					<Select
						onSelect={changeLanguage}
						defaultValue='kz'
						options={[
							{ value: 'kz', label: 'KZ' },
							{ value: 'ru', label: 'RU' },
						]}
					/>
				</div>
			</div>
		</div>
	)
}
