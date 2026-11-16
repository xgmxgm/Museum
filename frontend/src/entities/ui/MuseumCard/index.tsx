import { type FC } from 'react'
import type { IMuseum } from '../../type'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

interface IProps {
	museum: IMuseum
}

export const MuseumCard: FC<IProps> = ({ museum }) => {
	const { t } = useTranslation()

	return (
		<div className='border rounded-lg p-5 w-96'>
			<div className='h-full flex flex-col justify-between gap-5'>
				<img
					src={`${import.meta.env.VITE_API}${museum.image_url}`}
					alt='museum img'
					className='rounded h-80 object-cover'
				/>
				<div className='flex flex-col gap-3'>
					<p className='text-2xl'>{museum.name}</p>
					<p className='text-lg'>
						{museum.description.split(/\s+/).slice(0, 40).join(' ')}
						{museum.description.split(/\s+/).length > 40 && '...'}
					</p>
				</div>
				<div className='flex flex-col gap-2'>
					<Link
						className='flex items-center gap-3 bg-white p-3 rounded-full text-black justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer'
						to={`/museum/id=${museum.id}`}
					>
						{t('learnMore')}
					</Link>
					<a
						className='flex items-center gap-3 bg-white p-3 rounded-full text-black justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer'
						target='_blank'
						href={museum.two_gis_url}
					>
						{t('openIn')}
						<img src='/images/2gis.webp' alt='2gis icon' width={65} />
					</a>
					<address>
						{museum.city}, {museum.address}
					</address>
				</div>
			</div>
		</div>
	)
}
