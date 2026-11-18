import { useEffect, useMemo, useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../../../shared/libs/axios'
import type { IMuseum } from '../../../entities/type'
import { MuseumCard, MuseumCardSkeleton } from '../../../entities/ui/MuseumCard'
import { FiSearch, FiStar } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'

const FAVORITES_KEY = 'museum-favorites'

export const Museums: FC = () => {
	const [museums, setMuseums] = useState<IMuseum[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)
	const [query, setQuery] = useState('')
	const [city, setCity] = useState('')
	const [favoritesOnly, setFavoritesOnly] = useState(false)
	const [favorites, setFavorites] = useState<string[]>(() => {
		try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as string[] }
		catch { return [] }
	})
	const { t, i18n } = useTranslation()

	useEffect(() => {
		const controller = new AbortController()
		setIsLoading(true)
		setError(false)
		api.get('/museums?page=1&limit=100', { params: { lang: i18n.language }, signal: controller.signal })
			.then(res => setMuseums(res.data))
			.catch(err => { if (err.name !== 'CanceledError') setError(true) })
			.finally(() => { if (!controller.signal.aborted) setIsLoading(false) })
		return () => controller.abort()
	}, [i18n.language])

	const cities = useMemo(() => [...new Set(museums.map(museum => museum.city).filter(Boolean))].sort(), [museums])
	const filteredMuseums = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase()
		return museums.filter(museum => {
			const matchesQuery = !normalizedQuery || `${museum.name} ${museum.description} ${museum.city} ${museum.address}`.toLocaleLowerCase().includes(normalizedQuery)
			return matchesQuery && (!city || museum.city === city) && (!favoritesOnly || favorites.includes(museum.id))
		})
	}, [museums, query, city, favoritesOnly, favorites])

	const toggleFavorite = (id: string) => {
		setFavorites(current => {
			const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id]
			localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
			return next
		})
	}

	return (
		<section id='museums' className='flex justify-center py-20 md:py-28 scroll-mt-24'>
			<div className='w-11/12 max-w-[1440px] flex flex-col gap-8 md:gap-10'>
				<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className='flex flex-col md:flex-row md:items-end md:justify-between gap-5'>
					<div><p className='eyebrow mb-4'>{t('collectionKicker')}</p><h2 className='text-4xl md:text-6xl font-medium tracking-[-.05em]'>{t('museums')}<span className='text-[#d7a769]'>.</span></h2></div>
					<p className='text-sm md:text-base text-[#b8b7ad] max-w-sm leading-7'>{t('collectionSubtitle')}</p>
				</motion.div>
				<motion.div initial={{ scaleX: 0, opacity: 0 }} whileInView={{ scaleX: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: 'easeOut' }} style={{ transformOrigin: 'left' }} className='section-rule' />
				<motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className='flex flex-col sm:flex-row gap-3'>
					<label className='relative flex-1'>
						<FiSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-white/45' />
						<input value={query} onChange={event => setQuery(event.target.value)} placeholder={t('searchMuseums')} className='w-full rounded-full border border-white/10 bg-[#20231f] py-3 pl-11 pr-4 outline-none focus:border-[#d7a769]' />
					</label>
					<select value={city} onChange={event => setCity(event.target.value)} className='rounded-full border border-white/10 bg-[#20231f] px-5 py-3 outline-none focus:border-[#d7a769]'>
						<option value=''>{t('allCities')}</option>{cities.map(item => <option key={item} value={item}>{item}</option>)}
					</select>
					<button type='button' onClick={() => setFavoritesOnly(value => !value)} aria-pressed={favoritesOnly} className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 transition-colors ${favoritesOnly ? 'border-[#d7a769] text-[#d7a769]' : 'border-white/10 text-white/70 hover:border-white/30'}`}><FiStar />{t('favorites')}</button>
				</motion.div>
				{isLoading ? <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>{Array.from({ length: 3 }, (_, i) => <MuseumCardSkeleton key={i} />)}</div>
					: error ? <p className='py-12 text-center text-white/60'>{t('museumLoadError')}</p>
					: filteredMuseums.length ? <motion.div layout className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'><AnimatePresence mode='popLayout'>{filteredMuseums.map((museum, index) => <motion.div key={museum.id} layout initial={{ opacity: 0, y: 28, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.28), ease: [0.22, 1, 0.36, 1] }}><MuseumCard museum={museum} isFavorite={favorites.includes(museum.id)} onToggleFavorite={toggleFavorite} /></motion.div>)}</AnimatePresence></motion.div>
					: <p className='py-12 text-center text-white/60'>{t('noMuseumsFound')}</p>}
				<motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className='flex items-center gap-2 text-xs tracking-[.16em] text-white/45 uppercase'><span className='w-8 h-px bg-[#d7a769]' />{t('collectionFootnote')}</motion.div>
			</div>
		</section>
	)
}
