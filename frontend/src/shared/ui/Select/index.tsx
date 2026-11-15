import { type FC, type SelectHTMLAttributes } from 'react'
import './select.css'

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
        <select className="custom-select" {...props}>
            {options.map(option => (
                <option
                    className="custom-option"
                    key={option.value}
                    value={option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    )
}