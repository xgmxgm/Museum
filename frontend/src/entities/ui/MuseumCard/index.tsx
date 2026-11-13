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
				<img src={museum.image_url} alt='museum img' />
				<div className='flex flex-col gap-3'>
					<p className='text-2xl'>{museum.name}</p>
					<p className='text-lg'>{museum.description}</p>
				</div>
				<div className='flex flex-col gap-2'>
					<Link to={`/museum/id=${museum.id}`}>more</Link>
					<address>{museum.city + ' ' + museum.address}</address>
					<a
						className='bg-white p-3 rounded-full text-black flex items-center justify-center gap-3 font-semibold hover:bg-gray-200 transition-all'
						target='_blank'
						href={museum.two_gis_url}
					>
						{t('openIn')}
						<img src='/images/2gis.webp' alt='2gis icon' width={65} />
					</a>
				</div>
			</div>
		</div>
	)
}
