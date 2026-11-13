import { useEffect, useState, type FC } from 'react'
import { api } from '../../shared/libs/axios'
import type { IMuseum } from '../../entities/type'
import { useLocation } from 'react-router'

export const MuseumPage: FC = () => {
	const [museum, setMuseum] = useState<IMuseum | null>(null)

	const location = useLocation()

	useEffect(() => {
		const fetchMuseum = async () => {
			api
				.get(`/museums/${location.pathname.split('id')[1].slice(1)}`)
				.then(res => {
					setMuseum(res.data)
				})
		}

		fetchMuseum()
	}, [])

	useEffect(() => {
		console.log('museum: ', museum)
	})

	return <div>{museum?.name}</div>
}
