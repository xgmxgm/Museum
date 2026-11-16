import { api } from '../../shared/libs/axios'
import type { IMuseum } from '../../entities/type'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { IComment } from '../../shared/types'
import { Navigation } from '../../widgets/navigation'
import { Comments } from '../../widgets/comments'
import { FiStar } from 'react-icons/fi'
import { useAuthContext } from '../../features/Auth/context'
import { useCallback, useEffect, useState, type FC } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

export const MuseumPage: FC = () => {
	const [rating, setRating] = useState<number>(0)
	const [museum, setMuseum] = useState<IMuseum | null>(null)
	const [museumComments, setMuseumComments] = useState<IComment[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { id } = useParams()
	const { t, i18n } = useTranslation()
	const { isAuth } = useAuthContext()

	const fetchMuseum = async () => {
		setIsLoading(true)

		try {
			const res = await api.get(
				`/museums/${id?.slice(3)}?lang=${i18n.language}`,
			)

			setMuseum(res.data)
		} catch (e) {
			console.error(e)
		} finally {
			setIsLoading(false)
		}
	}

	const fetchMuseumComments = useCallback(async () => {
		if (!id?.slice(3)) return

		try {
			const res = await api.get(`/museums/${id?.slice(3)}/comments`)
			setMuseumComments(res.data)
		} catch (error) {
			console.error(error)
		}
	}, [id])

	const sendComment = async (comment: string) => {
		try {
			await api.post(`/museums/${id?.slice(3)}/comments`, {
				content: comment,
			})

			await fetchMuseumComments()
		} catch (error) {
			console.error(error)
		}
	}

	const fetchReview = async () => {
		try {
			const res = await api.get(`/museums/${id?.slice(3)}/reviews`)

			setRating(res.data?.[0]?.rating ?? 0)
		} catch (error) {
			console.error(error)
		}
	}

	const sendReview = async (value: number) => {
		try {
			if (rating) return

			await api.post(`/museums/${id?.slice(3)}/reviews`, {
				rating: value,
			})

			setRating(value)
			await fetchReview()
		} catch (error) {
			console.error(error)
		}
	}

	const deleteComment = async (id: string) => {
		try {
			await api.delete(`/comments/${id}`)

			await fetchMuseumComments()
		} catch (e) {
			console.error(e)
		}
	}

	useEffect(() => {
		fetchMuseumComments()
	}, [fetchMuseumComments])

	useEffect(() => {
		fetchMuseum()
		fetchReview()
	}, [i18n, id])

	if (isLoading) {
		return <MuseumPageSkeleton />
	}

	return (
		<div className='flex justify-center min-h-screen pt-20 md:pt-28 pb-10'>
			<div className='w-11/12 lg:w-10/12 flex flex-col md:flex-row items-start gap-5'>
				<div className='w-full md:w-auto'>
					<Navigation />
				</div>
				<div className='flex flex-col gap-5 flex-1 w-full min-w-0 glass-effect p-4 md:p-7 rounded-2xl'>
					<div className='flex flex-col gap-4'>
						<h2 className='text-xl md:text-2xl font-semibold'>
							{museum?.name}
						</h2>
						<div className='flex flex-col lg:flex-row gap-5'>
							<div className='w-full lg:w-96 min-w-0'>
								<Swiper
									modules={[Autoplay]}
									slidesPerView={'auto'}
									autoplay={{
										delay: 3000,
										disableOnInteraction: false,
									}}
									loop
								>
									{museum?.image_urls.map((img_url, index) => (
										<SwiperSlide key={index}>
											<div className='p-2'>
												<img
													src={`${import.meta.env.VITE_API}${img_url}`}
													alt='museum img'
													className='w-full h-56 sm:h-72 lg:h-auto rounded-lg object-cover'
												/>
											</div>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
							<div className='flex flex-col gap-4 flex-1 min-w-0'>
								<p className='text-sm md:text-base'>
									{t('raiting')}: {museum?.average_rating || t('noRaiting')}
								</p>
								<p className='text-sm md:text-base'>
									{t('year')}: {museum?.founded_year}
								</p>
								<p className='text-sm md:text-base wrap-break-words'>
									{t('address')}: {museum?.city}, {museum?.address}
								</p>
								<a
									className='flex items-center gap-3 bg-white p-2 rounded-full text-black justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer w-full sm:w-fit'
									target='_blank'
									rel='noopener noreferrer'
									href={museum?.two_gis_url}
								>
									{t('openIn')}
									<img src='/images/2gis.webp' alt='2gis icon' width={65} />
								</a>
								{isAuth && (
									<div className='flex flex-wrap items-center gap-2'>
										<p className='text-sm md:text-base'>{t('raiting')}:</p>
										<div className='flex items-center gap-1'>
											{[1, 2, 3, 4, 5].map(value => (
												<button
													key={value}
													type='button'
													onClick={() => sendReview(value)}
													className='text-2xl transition-all duration-200 hover:scale-125'
												>
													<FiStar
														fill={value <= rating ? 'currentColor' : 'none'}
														className={
															value <= rating
																? 'text-yellow-400'
																: 'text-gray-400'
														}
													/>
												</button>
											))}
										</div>
										<span className='text-sm text-gray-400'>{rating}/5</span>
									</div>
								)}
							</div>
						</div>
						<p className='text-sm md:text-base leading-relaxed wrap-break-words'>
							{museum?.description}
						</p>
					</div>
					<div className='w-full min-w-0'>
						<Comments
							comments={museumComments}
							sendComment={sendComment}
							deleteComment={deleteComment}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export const MuseumPageSkeleton: FC = () => {
	return (
		<div className='flex justify-center min-h-screen pt-24 md:pt-28 animate-pulse'>
			<div className='w-11/12 md:w-10/12 flex justify-between items-start gap-5'>
				{/* Sidebar */}
				<div className='hidden md:flex w-20 flex-col gap-4'>
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
				</div>

				{/* Main content */}
				<div className='flex flex-col gap-5 flex-1 glass-effect p-4 md:p-7 rounded-2xl'>
					<div className='h-7 w-2/3 md:w-1/3 bg-gray-700 rounded' />

					{/* Image + Info */}
					<div className='flex flex-col md:flex-row justify-between gap-5'>
						{/* Image */}
						<div className='w-full md:w-96 flex gap-3 overflow-hidden'>
							<div className='h-56 md:h-64 min-w-full bg-gray-700 rounded-lg' />
						</div>

						{/* Info */}
						<div className='flex flex-col gap-5 flex-1'>
							<div className='h-5 w-1/2 bg-gray-700 rounded' />
							<div className='h-5 w-1/3 bg-gray-700 rounded' />
							<div className='h-5 w-3/4 bg-gray-700 rounded' />
							<div className='h-10 w-full bg-gray-700 rounded-full' />
							<div className='h-10 w-1/2 bg-gray-700 rounded-lg' />
						</div>
					</div>

					{/* Description */}
					<div className='flex flex-col gap-3'>
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-4/5 bg-gray-700 rounded' />
						<div className='h-4 w-2/3 bg-gray-700 rounded' />
					</div>

					{/* Additional information */}
					<div className='flex flex-col gap-5 mt-5'>
						<div className='h-7 w-1/2 md:w-1/4 bg-gray-700 rounded' />

						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className='flex flex-col gap-3 border-b border-gray-700 pb-5'
							>
								<div className='h-5 w-1/2 md:w-1/4 bg-gray-700 rounded' />
								<div className='h-4 w-full bg-gray-700 rounded' />
								<div className='h-4 w-2/3 bg-gray-700 rounded' />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
