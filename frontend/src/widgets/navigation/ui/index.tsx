import { useEffect, useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../shared/libs/axios'
import type { IMuseum } from '../../../entities/type'
import { Link } from 'react-router'

export const Navigation: FC = () => {
	const [museums, setMuseums] = useState<IMuseum[]>([])
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const fetchMuseums = async () => {
			try {
				const res = await api.get(`/museums?lang=${i18n.language}`)
				setMuseums(res.data)
			} catch (e) {
				console.error(e)
			}
		}

		fetchMuseums()
	}, [i18n])

	return (
		<div className='flex flex-col glass-effect rounded-2xl gap-7'>
			<p className='text-2xl font-semibold mx-5 mt-7'>{t('navigation')}</p>
			<div className='flex flex-col gap-8'>
				{museums.map((museum, index) => (
					<div key={museum.id} className={`mx-5 ${index == museums.length - 1 && 'mb-7'}`}>
						<Link
							className='text-lg hover:text-gray-300 transition-all'
							to={`/museum/id=${museum.id}`}
						>
							{museum.name}
						</Link>
					</div>
				))}
			</div>
		</div>
	)
}
