import { Select } from 'antd'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../../shared/ui/logo'

export const DesktopHeader: FC = () => {
	const { t, i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	return (
		<div className='w-full flex items-center justify-center fixed top-3'>
			<div className='p-7 rounded-lg w-10/12 flex items-center justify-between glass-effect'>
				<Logo />
				<div className='flex gap-5 justify-center items-center'>
					<button>{t('signUp')}</button>
					<button>{t('signIn')}</button>
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
