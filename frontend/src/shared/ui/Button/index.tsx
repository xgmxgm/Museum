import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

interface IProps extends PropsWithChildren<
	ButtonHTMLAttributes<HTMLButtonElement>
> {
	stylesBtn?: 'primary' | 'secondary'
}

export const Button: FC<IProps> = ({
	children,
	stylesBtn = 'primary',
	className,
	...props
}) => {
	if (stylesBtn === 'primary') {
		return (
			<button
				{...props}
				className={`bg-white p-3 rounded-full text-black flex items-center justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer ${className}`}
			>
				{children}
			</button>
		)
	}

	if (stylesBtn === 'secondary') {
		return (
			<button
				{...props}
				className={`bg-white p-2 rounded-lg text-black flex items-center justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer ${className}`}
			>
				{children}
			</button>
		)
	}
}
