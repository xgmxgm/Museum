import { api } from '../../shared/libs/axios'
import type { IMuseum } from '../../entities/type'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { IComment } from '../../shared/types'
import { Navigation } from '../../widgets/navigation'
import { Comments } from '../../widgets/comments'
import { Button } from '../../shared/ui/Button'
import { Modal } from '../../shared/ui/Modal'
import { Input } from '../../shared/ui/Input'
import { FiStar } from 'react-icons/fi'
import { useAuthContext } from '../../features/Auth/context'
import { useCallback, useEffect, useState, type FC } from 'react'

export const MuseumPage: FC = () => {
	const [rating, setRating] = useState<number>(0)
	const [review, setReview] = useState<string>('')
	const [isShowModal, setIsShowModal] = useState<boolean>(false)
	const [museum, setMuseum] = useState<IMuseum | null>(null)
	const [museumComments, setMuseumComments] = useState<IComment[]>([])

	const { id } = useParams()
	const { t, i18n } = useTranslation()
	const { isAuth } = useAuthContext()

	const fetchMuseum = async () => {
		api.get(`/museums/${id?.slice(3)}?lang=${i18n.language}`).then(res => {
			setMuseum(res.data)
		})
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

	const sendReview = async () => {
		try {
			await api.post(`/museums/${id?.slice(3)}/reviews`, {
				rating: rating,
				content: review,
			})
		} catch (error) {
			console.error(error)
		}
	}

	useEffect(() => {
		fetchMuseumComments()
	}, [fetchMuseumComments])

	useEffect(() => {
		fetchMuseum()
	}, [i18n, id])

	return (
		<div className='flex justify-center h-screen pt-28'>
			<div className='w-10/12 flex justify-between items-start gap-5'>
				<div>
					<Navigation />
				</div>
				<div className='flex flex-col gap-5 flex-1 glass-effect p-7 rounded-2xl'>
					<div className='flex flex-col gap-3'>
						<h2 className='text-xl font-semibold'>{museum?.name}</h2>
						<div className='flex justify-between'>
							<div>
								<img src={museum?.image_url} alt='museum img' />
							</div>
							<div className='flex flex-col gap-3'>
								<p>
									{t('raiting')}: {museum?.average_rating || t('noRaiting')}
								</p>
								<p>
									{t('year')}: {museum?.founded_year}
								</p>
								<p>
									{t('address')}: {museum?.city}, {museum?.address}
								</p>
								{isAuth && (
									<Button
										stylesBtn='secondary'
										onClick={() => setIsShowModal(true)}
									>
										{t('addMyReview')}
									</Button>
								)}
							</div>
						</div>
						<p>{museum?.description}</p>
					</div>
					<Comments comments={museumComments} sendComment={sendComment} />
				</div>
			</div>
			<Modal
				isShow={isShowModal}
				setIsShow={setIsShowModal}
				title={t('rateMuseum')}
			>
				<div className='flex flex-col gap-4 w-96'>
					<div className='flex items-center gap-3'>
						<p className='font-medium'>{t('raiting')}:</p>
						<div className='flex items-center gap-2'>
							{[1, 2, 3, 4, 5].map(value => (
								<button
									key={value}
									type='button'
									onClick={() => setRating(value)}
									className={`text-2xl transition-all duration-200 hover:scale-110 ${
										value <= rating ? 'text-yellow-400' : 'text-gray-400'
									}`}
								>
									<FiStar fill={value <= rating ? 'currentColor' : 'none'} />
								</button>
							))}
							<span className='text-sm text-gray-400 ml-2'>{rating}/5</span>
						</div>
					</div>
					<Input
						value={review}
						onChange={e => setReview(e.target.value)}
						placeholder={`${t('enterReview')}...`}
					/>
					<Button
						stylesBtn='secondary'
						disabled={!rating || !review.trim()}
						onClick={sendReview}
					>
						{t('send')}
					</Button>
				</div>
			</Modal>
		</div>
	)
}
