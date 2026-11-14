import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

interface IProps extends PropsWithChildren<
	ButtonHTMLAttributes<HTMLButtonElement>
> {
	stylesBtn?: 'primary' | '2gisLink'
}

export const Button: FC<IProps> = ({
	children,
	stylesBtn,
	className,
	...props
}) => {
	return (
		<button
			{...props}
			className={`bg-white p-3 rounded-full text-black flex items-center justify-center font-semibold hover:bg-gray-200 transition-all cursor-pointer ${className}`}
		>
			{children}
		</button>
	)
}
