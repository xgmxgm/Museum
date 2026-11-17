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
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { motion } from 'framer-motion'

export const MuseumPage: FC = () => {
	const [rating, setRating] = useState<number>(0)
	const [museum, setMuseum] = useState<IMuseum | null>(null)
	const [museumComments, setMuseumComments] = useState<IComment[]>([])
	const [isLoading, setIsLoading] = useState(true)

	const { id } = useParams()
	const { t, i18n } = useTranslation()
	const { isAuth, user } = useAuthContext()
	const museumId = id?.replace(/^id=/, '')

	const fetchMuseumComments = useCallback(async () => {
		if (!museumId) return

		try {
			const res = await api.get(`/museums/${museumId}/comments`)
			setMuseumComments(res.data)
		} catch (error) {
			console.error(error)
		}
	}, [museumId])

	const sendComment = async (comment: string) => {
		try {
			await api.post(`/museums/${museumId}/comments`, {
				content: comment,
			})

			await fetchMuseumComments()
		} catch (error) {
			console.error(error)
		}
	}

	const sendReview = async (value: number) => {
		try {
			if (rating) return

			await api.post(`/museums/${museumId}/reviews`, {
				rating: value,
			})

			setRating(value)
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
		if (!museumId) return
		const controller = new AbortController()
		setIsLoading(true)
		Promise.all([
			api.get(`/museums/${museumId}`, {
				params: { lang: i18n.language },
				signal: controller.signal,
			}),
			api.get(`/museums/${museumId}/reviews`, { signal: controller.signal }),
		])
			.then(([museumResponse, reviewsResponse]) => {
				setMuseum(museumResponse.data)
				const ownReview = reviewsResponse.data.find(
					(review: { user_id: string; rating: number }) =>
						review.user_id === user?.user.id,
				)
				setRating(ownReview?.rating ?? 0)
			})
			.catch(error => {
				if (error.name !== 'CanceledError') console.error(error)
			})
			.finally(() => {
				if (!controller.signal.aborted) setIsLoading(false)
			})
		return () => controller.abort()
	}, [museumId, i18n.language, user?.user.id])

	if (isLoading) {
		return <MuseumPageSkeleton />
	}

	return (
		<div className='flex justify-center min-h-screen pt-28 md:pt-36 pb-16'>
			<div className='w-11/12 max-w-360 flex flex-col md:flex-row items-start gap-5'>
				<div className='w-full md:w-auto'>
					<Navigation />
				</div>
				<motion.div
					initial={{ opacity: 0, y: 28, scale: 0.985 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
					className='flex flex-col gap-6 flex-1 w-full min-w-0 bg-[#20231f] border border-white/10 p-4 md:p-8 rounded-2xl'
				>
					<div className='flex flex-col gap-4'>
						<p className='eyebrow'>{t('collectionKicker')}</p>
						<h2 className='text-3xl md:text-5xl font-semibold tracking-[-.04em]'>
							{museum?.name}
						</h2>
						<div className='flex flex-col lg:flex-row gap-5'>
							<div className='w-full lg:w-[min(42%,32rem)] min-w-0 rounded-2xl overflow-hidden'>
								<Swiper
									modules={[Pagination]}
									slidesPerView={1}
									spaceBetween={0}
									loop={(museum?.image_urls?.length ?? 0) > 1}
									pagination={{ clickable: true }}
									grabCursor
									className='museum-gallery'
								>
									{(museum?.image_urls ?? []).map((img_url, index) => (
										<SwiperSlide key={`${img_url}-${index}`}>
											<img
												src={`${import.meta.env.VITE_API}${img_url}`}
												alt='museum img'
												loading={index === 0 ? 'eager' : 'lazy'}
												className='block w-full h-64 sm:h-80 lg:h-108 object-cover'
											/>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
							<div className='flex flex-col gap-5 flex-1 min-w-0 bg-[#191c19] rounded-2xl p-5 md:p-7'>
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
									className='flex items-center gap-3 bg-[#e9e1d2] p-3 px-5 rounded-full text-[#171a17] justify-center font-semibold hover:bg-[#d7a769] transition-all cursor-pointer w-full sm:w-fit'
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
				</motion.div>
			</div>
		</div>
	)
}

export const MuseumPageSkeleton: FC = () => {
	return (
		<div className='flex justify-center min-h-screen pt-24 md:pt-28 animate-pulse'>
			<div className='w-11/12 md:w-10/12 flex justify-between items-start gap-5'>
				<div className='hidden md:flex w-20 flex-col gap-4'>
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
					<div className='h-10 w-full bg-gray-700 rounded-lg' />
				</div>
				<div className='flex flex-col gap-5 flex-1 glass-effect p-4 md:p-7 rounded-2xl'>
					<div className='h-7 w-2/3 md:w-1/3 bg-gray-700 rounded' />
					<div className='flex flex-col md:flex-row justify-between gap-5'>
						<div className='w-full md:w-96 flex gap-3 overflow-hidden'>
							<div className='h-56 md:h-64 min-w-full bg-gray-700 rounded-lg' />
						</div>
						<div className='flex flex-col gap-5 flex-1'>
							<div className='h-5 w-1/2 bg-gray-700 rounded' />
							<div className='h-5 w-1/3 bg-gray-700 rounded' />
							<div className='h-5 w-3/4 bg-gray-700 rounded' />
							<div className='h-10 w-full bg-gray-700 rounded-full' />
							<div className='h-10 w-1/2 bg-gray-700 rounded-lg' />
						</div>
					</div>
					<div className='flex flex-col gap-3'>
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-4/5 bg-gray-700 rounded' />
						<div className='h-4 w-2/3 bg-gray-700 rounded' />
					</div>
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
