import { useState, type FC } from 'react'
import type { IComment } from '../../../shared/types'
import { useAuthContext } from '../../../features/Auth/context'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useTranslation } from 'react-i18next'
import { FaRegTrashCan } from 'react-icons/fa6'

interface IProps {
	comments: IComment[]
	sendComment: (comment: string) => void
	deleteComment: (id: string) => {}
}

export const Comments: FC<IProps> = ({
	comments,
	sendComment,
	deleteComment,
}) => {
	const [comment, setComment] = useState<string>('')

	const { isAuth, user } = useAuthContext()
	const { t } = useTranslation()

	return (
		<div className='flex flex-col gap-5'>
			<p className='text-2xl font-semibold'>{t('comments')}</p>
			{isAuth && (
				<div className='flex items-center gap-3'>
					<Input
						value={comment}
						onChange={e => setComment(e.target.value)}
						placeholder={`${t('comment')}...`}
						className='w-full'
					/>
					<Button
						stylesBtn='secondary'
						className='rounded-lg'
						onClick={async () => {
							await sendComment(comment)
							setComment('')
						}}
					>
						{t('send')}
					</Button>
				</div>
			)}
			<div className='flex flex-col gap-3'>
				{comments.length ? (
					comments.map(comment => (
						<div className='border rounded-lg p-3' key={comment.id}>
							<div className='flex justify-between'>
								<p className='text-gray-300'>{comment.username}</p>
								{user?.user.id == comment.user_id && (
									<FaRegTrashCan
										onClick={async () => await deleteComment(comment.id)}
										className='cursor-pointer'
										size={14}
									/>
								)}
							</div>
							<p>{comment.content}</p>
						</div>
					))
				) : (
					<p>{t('noComment')}</p>
				)}
			</div>
		</div>
	)
}
