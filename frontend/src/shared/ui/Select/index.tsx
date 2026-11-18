import { type FC, type SelectHTMLAttributes } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import './select.css'

type option = {
    value: string
    label: string
    selected?: boolean
}

interface IProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options?: option[]
}

export const Select: FC<IProps> = ({ options = [], className = '', ...props }) => {
    return (
        <span className="custom-select-wrap">
            <select className={`custom-select ${className}`} {...props}>
                {options.map(option => <option className="custom-option" key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <FiChevronDown aria-hidden="true" className="custom-select-icon" />
        </span>
    )
}
