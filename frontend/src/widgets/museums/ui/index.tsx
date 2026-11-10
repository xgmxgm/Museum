import { useEffect, useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../shared/libs/axios'
import type { IMuseum } from '../../../entities/type'
import { MuseumCard } from '../../../entities/ui/MuseumCard'

export const Museums: FC = () => {
	const [museums, setMuseums] = useState<IMuseum[]>([])

	const { t } = useTranslation()

	useEffect(() => {
		const fetchMuseums = async () => {
			try {
				const res = await api.get('/museums')
				setMuseums(res.data)
			} catch (e) {
				console.error(e)
			}
		}

		fetchMuseums()
	}, [])

	return (
		<div className='flex justify-center'>
			<div className='w-10/12 mt-15 flex flex-col gap-10'>
				<p className='text-5xl font-serif font-bold'>{t('museums')}</p>
				<div className='flex gap-3'>
					{museums.map(museum => (
						<MuseumCard key={museum.id} museum={museum} />
					))}
				</div>
			</div>
		</div>
	)
}
