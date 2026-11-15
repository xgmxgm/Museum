import { RxCross2 } from 'react-icons/rx'
import { type FC, type PropsWithChildren } from 'react'

interface IProps {
	isShow: boolean
	setIsShow: (isShow: boolean) => void
	title?: string
}

export const Modal: FC<PropsWithChildren<IProps>> = ({
	isShow,
	setIsShow,
	children,
	title = '',
}) => {
	return (
		<>
			{isShow && (
				<div
					className='z-10 top-0 left-0 fixed h-screen w-screen flex items-center justify-center bg-black/60 transition-all'
					onClick={() => {
						setIsShow(false)
					}}
				>
					<div
						onClick={e => e.stopPropagation()}
						className='flex flex-col glass-effect p-5 rounded-xl border shadow-2xl'
					>
						<div
							className={`flex mb-5 items-center ${title ? 'justify-between' : 'justify-end'}`}
						>
							{title && <p className='text-xl font-semibold'>{title}</p>}
							<RxCross2
								size={20}
								className='cursor-pointer'
								onClick={() => setIsShow(false)}
							/>
						</div>
						<div>{children}</div>
					</div>
				</div>
			)}
		</>
	)
}
