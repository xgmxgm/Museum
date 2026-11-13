import type { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react'

interface IProps extends PropsWithChildren<
	ButtonHTMLAttributes<HTMLButtonElement>
> {
	stylesBtn?: 'primary' | '2gisLink'
}

export const Button: FC<IProps> = ({ children, stylesBtn, ...props }) => {
	if (stylesBtn === '2gisLink') {
		return <button {...props}>{children}</button>
	}

	return <button {...props}>{children}</button>
}
