import { useState, type FC, type InputHTMLAttributes } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface IProps extends InputHTMLAttributes<HTMLInputElement> {
	showPasswordToggle?: boolean
}

export const Input: FC<IProps> = ({
	className = '',
	type = 'text',
	showPasswordToggle = false,
	...props
}) => {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	const isPassword = type === 'password' && showPasswordToggle

	return (
		<div className='relative w-full'>
			<input
				className={`p-2 rounded-lg border w-full ${
					isPassword ? 'pr-10' : ''
				} ${className}`}
				type={isPassword && isPasswordVisible ? 'text' : type}
				{...props}
			/>

			{isPassword && (
				<button
					type='button'
					onClick={() => setIsPasswordVisible(prev => !prev)}
					className='
                        absolute right-3 top-1/2 -translate-y-1/2
                        text-gray-400 hover:text-gray-700
                        transition-colors duration-200
                    '
					aria-label={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
				>
					{isPasswordVisible ? <FiEyeOff size={19} /> : <FiEye size={19} />}
				</button>
			)}
		</div>
	)
}
