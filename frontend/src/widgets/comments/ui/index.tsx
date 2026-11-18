import { useState, type FC } from 'react'
import type { IComment } from '../../../shared/types'
import { useAuthContext } from '../../../features/Auth/context'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useTranslation } from 'react-i18next'
import { FiMessageCircle, FiTrash2 } from 'react-icons/fi'

interface IProps {
	comments: IComment[]
	sendComment: (comment: string) => Promise<void>
	deleteComment: (id: string) => Promise<void>
	isLoading?: boolean
}

export const Comments: FC<IProps> = ({
	comments,
	sendComment,
	deleteComment,
	isLoading = false,
}) => {
	const [comment, setComment] = useState<string>('')
	const [isSending, setIsSending] = useState(false)
	const [deletingId, setDeletingId] = useState<string | null>(null)
	const [error, setError] = useState(false)

	const { isAuth, user } = useAuthContext()
	const { t, i18n } = useTranslation()

	return (
		<div className='overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#20231f] to-[#191c19] shadow-xl shadow-black/10'>
			<div className='flex items-center justify-between border-b border-white/[.07] px-5 py-5 md:px-7'>
				<div><p className='eyebrow mb-2'>{t('collectionKicker')}</p><h3 className='text-2xl font-semibold tracking-tight'>{t('comments')}</h3></div>
				<span className='rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-sm text-white/60'>{comments.length}</span>
			</div>
			<div className='flex flex-col gap-6 p-5 md:p-7'>
			{isAuth && (
				<form className='flex flex-col gap-3 sm:flex-row' onSubmit={async event => {
					event.preventDefault()
					const content = comment.trim()
					if (!content || isSending) return
					setError(false); setIsSending(true)
					try { await sendComment(content); setComment('') } catch { setError(true) } finally { setIsSending(false) }
				}}>
					<Input
						value={comment}
						onChange={e => setComment(e.target.value)}
						placeholder={`${t('comment')}...`}
						maxLength={1000}
						className='w-full rounded-xl border-white/10 bg-[#151714] px-4 py-3 text-white placeholder:text-white/35 focus:border-[#d7a769] focus:outline-none focus:ring-2 focus:ring-[#d7a769]/15'
					/>
					<Button
						stylesBtn='secondary'
						className='min-h-11 shrink-0 rounded-xl bg-[#e9e1d2] px-6 text-[#171a17] hover:bg-[#d7a769]'
						disabled={!comment.trim()}
						isLoading={isSending}
					>
						{t('send')}
					</Button>
				</form>
			)}
			{error && <p role='alert' className='text-sm text-red-300'>{t('commentActionError')}</p>}
			<div className='flex flex-col gap-3'>
				{isLoading ? Array.from({ length: 2 }, (_, index) => <div key={index} className='animate-pulse rounded-xl border border-white/[.06] bg-white/[.025] p-4'><div className='mb-3 h-3 w-28 rounded bg-white/10' /><div className='h-4 w-4/5 rounded bg-white/10' /></div>) : comments.length ? (
					comments.map(comment => (
						<div className='group rounded-xl border border-white/[.07] bg-white/[.025] p-4 transition-colors hover:border-[#d7a769]/25 hover:bg-white/[.04]' key={comment.id}>
							<div className='mb-2 flex items-center justify-between gap-3'>
								<div className='flex min-w-0 items-center gap-2'><span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7a769]/15 text-xs font-bold text-[#d7a769]'>{comment.username.slice(0, 1).toUpperCase()}</span><div className='min-w-0'><p className='truncate text-sm font-semibold text-white/85'>{comment.username}</p><time className='text-xs text-white/40' dateTime={comment.created_at}>{new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date(comment.created_at))}</time></div></div>
								{user?.user.id == comment.user_id && (
									<button type='button' aria-label={t('deleteComment')} disabled={deletingId === comment.id} onClick={async () => { setError(false); setDeletingId(comment.id); try { await deleteComment(comment.id) } catch { setError(true) } finally { setDeletingId(null) } }} className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/35 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50'>{deletingId === comment.id ? <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#d7a769]' /> : <FiTrash2 size={16} />}</button>
								)}
							</div>
							<p className='whitespace-pre-wrap break-words pl-10 text-sm leading-6 text-white/70'>{comment.content}</p>
						</div>
					))
				) : (
					<div className='flex flex-col items-center rounded-xl border border-dashed border-white/10 px-5 py-10 text-center'><FiMessageCircle className='mb-3 text-2xl text-[#d7a769]/70' /><p className='font-medium text-white/75'>{t('noComment')}</p><p className='mt-1 text-sm text-white/40'>{t('firstComment')}</p></div>
				)}
			</div>
			</div>
		</div>
	)
}
