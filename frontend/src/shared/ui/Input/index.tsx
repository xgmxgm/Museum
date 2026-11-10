import { type FC, type InputHTMLAttributes } from 'react'

interface IProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input: FC<IProps> = props => {
	return <input className='p-2 rounded-lg border' type='text' {...props} />
}
