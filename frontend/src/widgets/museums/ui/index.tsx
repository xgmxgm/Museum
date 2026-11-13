import { useTranslation } from 'react-i18next'
import { api } from '../../../shared/libs/axios'
import { useEffect, useState, type FC } from 'react'
import type { IMuseum } from '../../../entities/type'
import { MuseumCard } from '../../../entities/ui/MuseumCard'

import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

export const Museums: FC = () => {
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
		<div className='flex justify-center'>
			<div className='w-10/12 mt-15 flex flex-col gap-10'>
				<p className='text-5xl font-serif font-bold'>{t('museums')}</p>
				<div>
					<Swiper
						modules={[Navigation, Pagination, Autoplay]}
						slidesPerView={3}
						autoplay={{
							delay: 3000,
							disableOnInteraction: false,
						}}
						loop
					>
						{museums.map(museum => (
							<SwiperSlide>
								<MuseumCard key={museum.id} museum={museum} />
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</div>
	)
}
