import { useEffect, useState, type FC } from 'react'
import { api } from '../../shared/libs/axios'
import type { IMuseum } from '../../entities/type'
import { useLocation } from 'react-router'
import { Input } from '../../shared/ui/Input'
import { useTranslation } from 'react-i18next'
import type { IComment } from '../../shared/types'
import { Button } from '../../shared/ui/Button'
import { Navigation } from '../../widgets/navigation'
import { useAuthContext } from '../../features/Auth/context'

export const MuseumPage: FC = () => {
	const [comment, setComment] = useState<string>('')
	const [museum, setMuseum] = useState<IMuseum | null>(null)
	const [museumComments, setMuseumComments] = useState<IComment[]>([])

	const { isAuth } = useAuthContext()
	const location = useLocation()
	const { t, i18n } = useTranslation()

	const fetchMuseum = async () => {
		api
			.get(
				`/museums/${location.pathname.split('id')[1].slice(1)}?lang=${i18n.language}`,
			)
			.then(res => {
				setMuseum(res.data)
			})
	}

	const sendComment = async () => {
		await api
			.post(`/museums/${location.pathname.split('id')[1].slice(1)}/comments`, {
				content: comment,
			})
			.then(() => {
				setComment('')
			})
			.catch(e => {
				console.error(e)
			})
	}

	useEffect(() => {
		const fetchMuseumComments = async () => {
			api
				.get(`/museums/${location.pathname.split('id')[1].slice(1)}/comments`)
				.then(res => {
					setMuseumComments(res.data)
				})
		}

		fetchMuseumComments()
	}, [sendComment])

	useEffect(() => {
		fetchMuseum()
	}, [i18n])

	useEffect(() => {
		fetchMuseum()
	}, [])

	return (
		<div className='flex justify-center items-center h-screen'>
			<div className='w-10/12 flex justify-between items-start gap-5'>
				<div>
					<Navigation />
				</div>
				<div className='flex flex-col gap-5 flex-1 glass-effect p-7 rounded-2xl'>
					<div className='flex flex-col gap-3'>
						<h2 className='text-xl font-semibold'>{museum?.name}</h2>
						<img src={museum?.image_url} alt='museum img' />
						<p>{museum?.founded_year}</p>
						<p>{museum?.description}</p>
						<p>
							{museum?.city} {museum?.address}
						</p>
					</div>
					{isAuth && (
						<div className='flex flex-col'>
							<div className='flex items-center gap-3'>
								<Input
									value={comment}
									onChange={e => setComment(e.target.value)}
									placeholder={`${t('comment')}...`}
								/>
								<Button className='rounded-lg' onClick={sendComment}>
									{t('send')}
								</Button>
							</div>
							{museumComments.length ? (
								museumComments.map(comment => (
									<div key={comment.id}>
										<p>{comment.content}</p>
									</div>
								))
							) : (
								<p>{t('noComment')}</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
