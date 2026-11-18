import { type FC } from 'react'
import { useTranslation } from 'react-i18next'

export const Footer: FC = () => {
	const { t } = useTranslation()
	return (
		<div className='flex justify-center py-8 border-t border-white/10 mt-5 text-xs text-white/45'>
			<div className='w-11/12 max-w-[1440px] flex justify-between gap-4'><span>© 2026 MUSEUMS OF KAZAKHSTAN</span><span>{t('allRightsReserved')}</span></div>
		</div>
	)
}
