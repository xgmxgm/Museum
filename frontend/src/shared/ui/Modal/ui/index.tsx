import { RxCross2 } from 'react-icons/rx'
import { type FC, type PropsWithChildren } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface IProps {
	isShow: boolean
	setIsShow: (isShow: boolean) => void
	title?: string
}

const variants = {
	hidden: {
		opacity: 0,
		scale: 0,
	},
	visible: {
		opacity: 1,
		scale: 1,
	},
}

export const Modal: FC<PropsWithChildren<IProps>> = ({
	isShow,
	setIsShow,
	children,
	title = '',
}) => {
	return (
		<AnimatePresence>
			{isShow && (
				<div
					className='z-10 top-0 left-0 fixed h-screen w-screen flex items-center justify-center bg-black/60 transition-all'
					onClick={() => {
						setIsShow(false)
					}}
				>
					<motion.div
						onClick={e => e.stopPropagation()}
						className='flex flex-col glass-effect p-5 rounded-xl border shadow-2xl'
						variants={variants}
						initial='hidden'
						animate='visible'
						exit='hidden'
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
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	)
}
