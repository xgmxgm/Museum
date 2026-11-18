import { type FC } from 'react'
import type { IMuseum } from '../../type'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { FiArrowUpRight, FiMapPin, FiStar } from 'react-icons/fi'

interface IProps {
	museum: IMuseum
	isFavorite?: boolean
	onToggleFavorite?: (id: string) => void
}

export const MuseumCard: FC<IProps> = ({
	museum,
	isFavorite = false,
	onToggleFavorite,
}) => {
	const { t } = useTranslation()

	return (
		<div className='museum-card rounded-2xl p-3 w-full h-full'>
			<div className='h-full flex flex-col gap-5'>
				<div className='museum-image relative rounded-xl h-72 sm:h-80 overflow-hidden'>
					<img
						src={`${import.meta.env.VITE_API}${museum.image_url}`}
						alt={museum.name}
						loading='lazy'
						decoding='async'
						className='w-full h-full object-cover'
					/>
					<span className='absolute z-[1] top-4 left-4 rounded-full border border-white/20 bg-black/35 backdrop-blur-md px-3 py-1.5 text-[10px] tracking-[.18em] uppercase'>
						{museum.founded_year}
					</span>
					{onToggleFavorite && (
						<button
							type='button'
							onClick={() => onToggleFavorite(museum.id)}
							aria-label={isFavorite ? t('removeFavorite') : t('addFavorite')}
							aria-pressed={isFavorite}
							className='absolute z-[2] top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-[#f3c977] backdrop-blur-md'
						>
							<FiStar size={18} fill={isFavorite ? 'currentColor' : 'none'} />
						</button>
					)}
					<Link
						aria-label={`${t('learnMore')}: ${museum.name}`}
						to={`/museum/id=${museum.id}`}
						className='absolute z-[1] bottom-4 right-4 w-11 h-11 rounded-full bg-[#e9e1d2] text-[#171a17] flex items-center justify-center hover:bg-[#d7a769] transition-colors'
					>
						<FiArrowUpRight size={21} />
					</Link>
				</div>
				<div className='flex flex-col gap-3'>
					<p className='text-xl md:text-2xl leading-tight font-semibold tracking-[-.025em]'>
						{museum.name}
					</p>
					<p className='text-sm leading-6 text-[#b8b7ad] min-h-12'>
						{museum.description.split(/\s+/).slice(0, 26).join(' ')}
						{museum.description.split(/\s+/).length > 26 && '…'}
					</p>
				</div>
				<div className='mt-auto flex flex-col gap-3'>
					<Link
						className='flex items-center gap-3 bg-[#e9e1d2] p-3 rounded-full text-[#171a17] justify-center font-semibold hover:bg-[#d7a769] transition-all cursor-pointer'
						to={`/museum/id=${museum.id}`}
					>
						{t('learnMore')}
					</Link>
					<a
						className='flex items-center gap-3 p-2 rounded-full text-white/80 justify-center font-semibold hover:text-[#d7a769] transition-all cursor-pointer text-sm'
						target='_blank'
						rel='noopener noreferrer'
						href={museum.two_gis_url}
					>
						{t('openIn')}
						<img src='/images/2gis.webp' alt='2gis icon' width={65} />
					</a>
					<address className='flex items-center justify-center gap-2 text-xs not-italic text-white/50'>
						<FiMapPin /> {museum.city}, {museum.address}
					</address>
				</div>
			</div>
		</div>
	)
}

export const MuseumCardSkeleton: FC = () => {
	return (
		<div className='museum-card rounded-2xl p-3 w-full animate-pulse'>
			<div className='h-full flex flex-col justify-between gap-5'>
				<div className='h-72 sm:h-80 w-full bg-white/10 rounded-xl' />

				<div className='flex flex-col gap-3'>
					<div className='h-7 w-3/4 bg-gray-700 rounded' />

					<div className='flex flex-col gap-2'>
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-full bg-gray-700 rounded' />
						<div className='h-4 w-2/3 bg-gray-700 rounded' />
					</div>
				</div>

				<div className='flex flex-col gap-2'>
					<div className='h-12 w-full bg-gray-700 rounded-full' />
					<div className='h-12 w-full bg-gray-700 rounded-full' />

					<div className='h-4 w-2/3 bg-gray-700 rounded mt-2' />
				</div>
			</div>
		</div>
	)
}
