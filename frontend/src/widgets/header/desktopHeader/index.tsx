import { Select } from 'antd'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const DesktopHeader: FC = () => {
	const { i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	return (
		<div className='border p-5 rounded-xl flex items-center justify-between'>
			Heritage KZ
			<Select
				onSelect={changeLanguage}
				defaultValue='kz'
				options={[
					{ value: 'kz', label: 'KZ' },
					{ value: 'ru', label: 'RU' },
				]}
			/>
		</div>
	)
}
