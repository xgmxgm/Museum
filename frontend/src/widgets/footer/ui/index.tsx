import { type FC } from 'react'
import { useTranslation } from 'react-i18next'

export const Footer: FC = () => {
	const { t } = useTranslation()
	return (
		<div className='flex justify-center py-9 border-t mt-5'>
			<div className='w-10/12'>@{t('allRightsReserved')}</div>
		</div>
	)
}
