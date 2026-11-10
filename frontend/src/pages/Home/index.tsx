import type { FC } from 'react'
import { Welcome } from '../../widgets/welcome'
import { Museums } from '../../widgets/museums'

export const HomePage: FC = () => {
	return (
		<div>
			<Welcome />
			<Museums />
		</div>
	)
}
