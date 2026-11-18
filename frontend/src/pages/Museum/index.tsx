import { api } from '../../shared/libs/axios'
import type { IMuseum } from '../../entities/type'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { IComment } from '../../shared/types'
import { Navigation } from '../../widgets/navigation'
import { Comments } from '../../widgets/comments'
import { Button } from '../../shared/ui/Button'
import { FiArrowUpRight, FiStar } from 'react-icons/fi'
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
	const [reviewText, setReviewText] = useState('')
	const [reviewSaving, setReviewSaving] = useState(false)
	const [reviewError, setReviewError] = useState(false)
	const [reviewSaved, setReviewSaved] = useState(false)
	const [hasReview, setHasReview] = useState(false)
	const [museum, setMuseum] = useState<IMuseum | null>(null)
	const [museumComments, setMuseumComments] = useState<IComment[]>([])
	const [commentsLoading, setCommentsLoading] = useState(true)
	const [isLoading, setIsLoading] = useState(true)

	const { id } = useParams()
	const { t, i18n } = useTranslation()
	const { isAuth, user } = useAuthContext()
	const museumId = id?.replace(/^id=/, '')

	const fetchMuseumComments = useCallback(async () => {
		if (!museumId) return
		setCommentsLoading(true)
		try {
			const res = await api.get(`/museums/${museumId}/comments`)
			setMuseumComments(res.data)
		} catch (error) {
			console.error(error)
		} finally {
			setCommentsLoading(false)
		}
	}, [museumId])

	const sendComment = async (comment: string) => {
		await api.post(`/museums/${museumId}/comments`, { content: comment })
		await fetchMuseumComments()
	}

	const sendReview = async () => {
		if (!rating) return
		setReviewSaving(true)
		setReviewError(false)
		setReviewSaved(false)
		try {
			const payload = { rating, content: reviewText || null }
			if (hasReview) await api.put(`/museums/${museumId}/reviews`, payload)
			else {
				await api.post(`/museums/${museumId}/reviews`, payload)
				setHasReview(true)
			}
			const museumResponse = await api.get(`/museums/${museumId}`, { params: { lang: i18n.language } })
			setMuseum(museumResponse.data)
			setReviewSaved(true)
		} catch (error) {
			console.error(error)
			setReviewError(true)
		} finally {
			setReviewSaving(false)
		}
	}

	const deleteComment = async (id: string) => {
		await api.delete(`/comments/${id}`)
		await fetchMuseumComments()
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
					(review: { user_id: string; rating: number; content?: string | null }) =>
						review.user_id === user?.user.id,
				)
				setRating(ownReview?.rating ?? 0)
				setReviewText(ownReview?.content ?? '')
				setHasReview(Boolean(ownReview))
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
									className='group flex w-full items-center gap-3 rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-[#123c2d] via-[#174b36] to-[#20583d] p-2.5 pr-5 text-white shadow-lg shadow-emerald-950/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300/45 hover:shadow-emerald-950/40 sm:w-fit'
									target='_blank'
									rel='noopener noreferrer'
									href={museum?.two_gis_url}
								>
									<span className='flex h-11 items-center rounded-xl bg-white px-2.5'><img src='/images/2gis.webp' alt='2GIS' width={60} /></span>
									<span className='flex flex-1 flex-col text-left sm:flex-none'><span className='text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100/70'>2GIS</span><span className='font-semibold'>{t('openIn')}</span></span>
									<FiArrowUpRight className='ml-auto text-xl text-emerald-100 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5' />
								</a>
								{isAuth && (
									<div className='flex flex-wrap items-center gap-2'>
										<p className='text-sm md:text-base'>{t('raiting')}:</p>
										<div className='flex items-center gap-1'>
											{[1, 2, 3, 4, 5].map(value => (
												<button
													key={value}
													type='button'
														onClick={() => setRating(value)}
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
											<textarea value={reviewText} onChange={event => setReviewText(event.target.value)} maxLength={2000} placeholder={t('enterReview')} className='w-full min-h-24 rounded-xl border border-white/10 bg-[#20231f] p-3 text-sm outline-none focus:border-[#d7a769]' />
															<Button type='button' disabled={!rating} isLoading={reviewSaving} onClick={sendReview} stylesBtn='primary' className='rounded-full bg-[#e9e1d2] px-5 py-2.5 text-[#171a17] hover:bg-[#d7a769]'>{reviewSaved ? t('reviewSaved') : t('saveReview')}</Button>
															{reviewError && <p role='alert' className='w-full text-sm text-red-300'>{t('reviewSaveError')}</p>}
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
										isLoading={commentsLoading}
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
