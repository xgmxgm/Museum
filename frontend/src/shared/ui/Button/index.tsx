import type {
    ButtonHTMLAttributes,
    FC,
    PropsWithChildren,
} from 'react'

interface IProps extends PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement>
> {
    stylesBtn?: 'primary' | 'secondary'
    isLoading?: boolean
}

export const Button: FC<IProps> = ({
    children,
    stylesBtn = 'primary',
    isLoading = false,
    className,
    disabled,
    ...props
}) => {
    const baseStyles =
        'flex items-center justify-center font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

    const styles = {
        primary: 'bg-white p-3 rounded-full text-black hover:bg-gray-200',
        secondary: 'bg-white p-2 rounded-lg text-black hover:bg-gray-200',
    }

    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${styles[stylesBtn]} ${className ?? ''}`}
        >
            {isLoading ? (
                <span className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
            ) : (
                children
            )}
        </button>
    )
}
