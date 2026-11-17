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
		<div className='flex flex-col bg-[#20231f] border border-white/10 rounded-2xl gap-6 p-5 md:p-6 min-w-56'>
			<div><p className='eyebrow mb-2'>{t('collectionKicker')}</p><p className='text-xl font-semibold'>{t('navigation')}</p></div>
			<div className='section-rule' />
			<div className='flex flex-col gap-4'>
				{museums.map((museum, index) => (
					<div key={museum.id} className='flex items-center gap-3'>
						<span className='text-[10px] text-[#d7a769] font-bold'>0{index + 1}</span>
						<Link
							className='text-sm text-white/75 hover:text-[#d7a769] transition-all leading-snug'
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
