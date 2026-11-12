import { type FC, type SelectHTMLAttributes } from 'react'

type option = {
	value: string
	label: string
	selected?: boolean
}

interface IProps extends SelectHTMLAttributes<HTMLSelectElement> {
	options?: option[]
}

export const Select: FC<IProps> = ({ options = [], ...props }) => {
	return (
		<select className='border-none outline-none cursor-pointer' {...props}>
			{options.map(option => (
				<option className='text-black' key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}
