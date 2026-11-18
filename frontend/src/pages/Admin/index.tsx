import { useCallback, useEffect, useState, type ChangeEvent, type FC, type FormEvent } from 'react'
import { Link } from 'react-router'
import { api } from '../../shared/libs/axios'
import { useAuthContext } from '../../features/Auth/context'
import type { IMuseum } from '../../entities/type'

type MuseumDraft = Omit<IMuseum, 'average_rating' | 'image_urls'> & {
	name_kz: string
	description_kz: string
	city_kz: string
	address_kz: string
	image_urls: string[]
}
type ModerationItem = { id: string; content?: string | null; username?: string; rating?: number }
const blankDraft = (): MuseumDraft => ({ id: '', name: '', name_kz: '', description: '', description_kz: '', city: '', city_kz: '', address: '', address_kz: '', founded_year: new Date().getFullYear(), image_url: '', image_urls: [], two_gis_url: '' })

export const AdminPage: FC = () => {
	const { user } = useAuthContext()
	const [museums, setMuseums] = useState<IMuseum[]>([])
	const [draft, setDraft] = useState<MuseumDraft>(blankDraft)
	const [selected, setSelected] = useState('')
	const [comments, setComments] = useState<ModerationItem[]>([])
	const [reviews, setReviews] = useState<ModerationItem[]>([])
	const [busy, setBusy] = useState(false)
	const [message, setMessage] = useState('')

	const loadMuseums = useCallback(async () => {
		const response = await api.get('/museums?page=1&limit=100')
		setMuseums(response.data)
	}, [])

	useEffect(() => { loadMuseums().catch(() => setMessage('Не удалось загрузить список музеев')) }, [loadMuseums])
	useEffect(() => {
		if (!selected) { setComments([]); setReviews([]); return }
		Promise.all([api.get(`/museums/${selected}/comments`), api.get(`/museums/${selected}/reviews`)]).then(([commentResponse, reviewResponse]) => {
			setComments(commentResponse.data)
			setReviews(reviewResponse.data)
		}).catch(() => setMessage('Не удалось загрузить комментарии и отзывы'))
	}, [selected])

	const update = <K extends keyof MuseumDraft>(key: K, value: MuseumDraft[K]) => setDraft(current => ({ ...current, [key]: value }))
	const edit = (museum: IMuseum) => setDraft({ ...blankDraft(), ...museum, name_kz: '', description_kz: '', city_kz: '', address_kz: '', image_urls: museum.image_urls ?? [] })
	const saveMuseum = async (event: FormEvent) => {
		event.preventDefault(); setBusy(true); setMessage('')
		const id = draft.id
		const payload = {
			name: draft.name, name_kz: draft.name_kz || null,
			description: draft.description, description_kz: draft.description_kz || null,
			city: draft.city, city_kz: draft.city_kz || null,
			address: draft.address, address_kz: draft.address_kz || null,
			founded_year: draft.founded_year, image_url: draft.image_url || null,
			two_gis_url: draft.two_gis_url || null,
		}
		try {
			if (id) await api.put(`/admin/museums/${id}`, payload)
			else await api.post('/admin/museums', payload)
			setMessage(id ? 'Музей обновлён' : 'Музей добавлен')
			setDraft(blankDraft()); await loadMuseums()
		} catch { setMessage('Не удалось сохранить музей. Проверьте поля и права администратора.') }
		finally { setBusy(false) }
	}
	const deleteMuseum = async (id: string) => {
		if (!window.confirm('Удалить этот музей?')) return
		try { await api.delete(`/admin/museums/${id}`); if (selected === id) setSelected(''); await loadMuseums(); setMessage('Музей удалён') }
		catch { setMessage('Не удалось удалить музей') }
	}
	const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file || !draft.id) { setMessage('Сначала сохраните музей, затем добавляйте изображения'); return }
		const body = new FormData(); body.append('image', file)
		setBusy(true)
		try {
			const response = await api.post(`/admin/museums/${draft.id}/upload-image`, body)
			const urls = [...draft.image_urls, response.data.image_url]
			await api.put(`/admin/museums/${draft.id}/images`, { image_urls: urls })
			update('image_urls', urls); setMessage('Изображение загружено и добавлено в карусель'); await loadMuseums()
		} catch { setMessage('Не удалось загрузить изображение') }
		finally { setBusy(false); event.target.value = '' }
	}
	const saveImages = async () => {
		if (!draft.id) return
		try { await api.put(`/admin/museums/${draft.id}/images`, { image_urls: draft.image_urls }); setMessage('Карусель обновлена'); await loadMuseums() }
		catch { setMessage('Не удалось обновить карусель') }
	}
	const removeModerationItem = async (kind: 'comments' | 'reviews', id: string) => {
		try { await api.delete(`/admin/${kind}/${id}`); if (kind === 'comments') setComments(items => items.filter(item => item.id !== id)); else setReviews(items => items.filter(item => item.id !== id)) }
		catch { setMessage('Не удалось удалить запись') }
	}

	if (user?.user.role !== 'admin') return <main className='min-h-screen px-6 pt-32 text-center'><h1 className='text-3xl'>Доступ запрещён</h1><Link to='/' className='mt-5 inline-block text-[#d7a769]'>На главную</Link></main>
	const fields: { key: keyof MuseumDraft; label: string; multiline?: boolean; optional?: boolean }[] = [
		{ key: 'name', label: 'Название (RU)' }, { key: 'name_kz', label: 'Название (KZ)', optional: true }, { key: 'description', label: 'Описание (RU)', multiline: true }, { key: 'description_kz', label: 'Описание (KZ)', multiline: true, optional: true }, { key: 'city', label: 'Город (RU)' }, { key: 'city_kz', label: 'Город (KZ)', optional: true }, { key: 'address', label: 'Адрес (RU)' }, { key: 'address_kz', label: 'Адрес (KZ)', optional: true }, { key: 'founded_year', label: 'Год основания' }, { key: 'image_url', label: 'Главное изображение URL', optional: true }, { key: 'two_gis_url', label: 'Ссылка 2GIS', optional: true },
	]
	return <main className='min-h-screen px-5 pb-20 pt-32 text-[#f4efe5]'><div className='mx-auto max-w-6xl space-y-8'><header><p className='eyebrow'>Управление</p><h1 className='mt-3 text-4xl font-semibold'>Панель администратора</h1></header>
		{message && <p role='status' className='rounded-xl border border-[#d7a769]/30 bg-[#d7a769]/10 p-4'>{message}</p>}
		<section className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]'>
			<div className='space-y-3'><h2 className='text-xl font-semibold'>Музеи</h2>{museums.map(museum => <article key={museum.id} className='flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#20231f] p-4'><button className='min-w-0 truncate text-left' onClick={() => setSelected(museum.id)}>{museum.name}<span className='ml-2 text-sm text-white/50'>{museum.city}</span></button><div className='flex shrink-0 gap-3'><button onClick={() => edit(museum)} className='text-[#d7a769]'>Изменить</button><button onClick={() => deleteMuseum(museum.id)} className='text-red-300'>Удалить</button></div></article>)}</div>
			<form onSubmit={saveMuseum} className='grid gap-3 rounded-2xl border border-white/10 bg-[#20231f] p-5 sm:grid-cols-2'><h2 className='text-xl font-semibold sm:col-span-2'>{draft.id ? 'Редактировать музей' : 'Добавить музей'}</h2>{fields.map(field => <label key={field.key} className={`grid gap-1 text-sm text-white/65 ${field.multiline ? 'sm:col-span-2' : ''}`}>{field.label}{field.multiline ? <textarea required={!field.optional} value={String(draft[field.key] ?? '')} onChange={event => update(field.key, event.target.value as never)} className='min-h-24 rounded-lg border border-white/10 bg-[#171a17] p-3 text-white' /> : <input required={!field.optional} type={field.key === 'founded_year' ? 'number' : 'text'} value={String(draft[field.key] ?? '')} onChange={event => update(field.key, (field.key === 'founded_year' ? Number(event.target.value) : event.target.value) as never)} className='rounded-lg border border-white/10 bg-[#171a17] p-3 text-white' />}</label>)}
				{draft.id && <div className='grid gap-2 sm:col-span-2'><label className='text-sm text-white/65'>Изображения карусели, по одному URL на строку<textarea value={draft.image_urls.join('\n')} onChange={event => update('image_urls', event.target.value.split('\n').map(url => url.trim()).filter(Boolean))} className='mt-1 min-h-24 w-full rounded-lg border border-white/10 bg-[#171a17] p-3 text-white' /></label><div className='flex flex-wrap items-center gap-3'><button type='button' onClick={saveImages} className='rounded-full border border-white/20 px-4 py-2'>Сохранить список</button><label className='cursor-pointer rounded-full bg-[#d7a769] px-4 py-2 text-[#171a17]'>Загрузить изображение<input type='file' accept='image/*' onChange={uploadImage} className='hidden' disabled={busy} /></label></div></div>}
				<div className='flex gap-3 sm:col-span-2'><button disabled={busy} className='rounded-full bg-[#e9e1d2] px-5 py-3 font-semibold text-[#171a17] disabled:opacity-50'>{busy ? 'Сохранение…' : 'Сохранить'}</button>{draft.id && <button type='button' onClick={() => setDraft(blankDraft())} className='rounded-full border border-white/20 px-5 py-3'>Отмена</button>}</div>
			</form>
		</section>
		{selected && <section className='grid gap-8 md:grid-cols-2'><div><h2 className='mb-3 text-xl font-semibold'>Комментарии</h2>{comments.map(item => <article key={item.id} className='mb-2 flex justify-between gap-3 rounded-xl border border-white/10 p-3'><p><span className='text-[#d7a769]'>{item.username}</span><br />{item.content}</p><button onClick={() => removeModerationItem('comments', item.id)} className='text-red-300'>Удалить</button></article>)}</div><div><h2 className='mb-3 text-xl font-semibold'>Отзывы</h2>{reviews.map(item => <article key={item.id} className='mb-2 flex justify-between gap-3 rounded-xl border border-white/10 p-3'><p><span className='text-[#d7a769]'>{item.rating}/5</span><br />{item.content || 'Без текста'}</p><button onClick={() => removeModerationItem('reviews', item.id)} className='text-red-300'>Удалить</button></article>)}</div></section>}
		</div></main>
}
