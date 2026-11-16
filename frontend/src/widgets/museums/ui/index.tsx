import { useTranslation } from 'react-i18next'
import { api } from '../../../shared/libs/axios'
import { useEffect, useState, type FC } from 'react'
import type { IMuseum } from '../../../entities/type'
import { MuseumCard, MuseumCardSkeleton } from '../../../entities/ui/MuseumCard'

import 'swiper/css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { useWindowWidth } from '../../../shared/utils'

export const Museums: FC = () => {
	const [museums, setMuseums] = useState<IMuseum[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { width } = useWindowWidth()

	const { t, i18n } = useTranslation()

	useEffect(() => {
		const fetchMuseums = async () => {
			setIsLoading(true)

			try {
				const res = await api.get(`/museums?lang=${i18n.language}`)
				setMuseums(res.data)
			} catch (e) {
				console.error(e)
			} finally {
				setIsLoading(false)
			}
		}

		fetchMuseums()
	}, [i18n.language])

	return (
		<div className='flex justify-center'>
			<div className='w-10/12 mt-15 flex flex-col gap-10'>
				<p className='text-5xl font-serif font-bold'>{t('museums')}</p>
				<div>
					<Swiper
						modules={[Autoplay]}
						slidesPerView={width >= 1535 ? 3 : 'auto'}
						spaceBetween={20}
						autoplay={{
							delay: 3000,
							disableOnInteraction: false,
						}}
						loop={!isLoading && museums.length > 3}
					>
						{isLoading
							? Array.from({ length: 3 }).map((_, index) => (
									<SwiperSlide key={index}>
										<MuseumCardSkeleton />
									</SwiperSlide>
								))
							: museums.map(museum => (
									<SwiperSlide key={museum.id}>
										<MuseumCard museum={museum} />
									</SwiperSlide>
								))}
					</Swiper>
				</div>
			</div>
		</div>
	)
}
