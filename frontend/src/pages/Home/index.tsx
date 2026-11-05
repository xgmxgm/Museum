import type { FC } from 'react'
import { useTranslation } from 'react-i18next'

export const HomePage: FC = () => {
	const { t } = useTranslation()

	return (
		<div>
			home page
			<p>{t('test')}</p>
		</div>
	)
}
