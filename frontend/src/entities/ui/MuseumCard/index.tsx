import { type FC } from 'react'
import type { IMuseum } from '../../type'

interface IProps {
	museum: IMuseum
}

export const MuseumCard: FC<IProps> = ({ museum }) => {
	return <div className='border rounded-lg p-3'>{museum.name}</div>
}
