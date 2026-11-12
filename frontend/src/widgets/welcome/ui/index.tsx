import { type FC } from 'react'
import { useTranslation } from 'react-i18next'

export const Welcome: FC = () => {
	const { t } = useTranslation()

	return (
		<div className="bg-[url('./images/mainBackground.png')] bg-cover h-screen bg-center flex items-center justify-center">
			<div className='w-10/12 flex items-center'>
				<div className='w-5/6 mt-60'>
					<p className='text-7xl font-bold font-serif'>{t('greatFiguresOfTheKazakhPeople')}</p>
				</div>
			</div>
		</div>
	)
}
