import { motion } from 'framer-motion'
import { useEffect, type FC } from 'react'
import type { INotificationContext } from '../../type'

export const Notification: FC<INotificationContext> = ({
	setNotification,
	notification,
}) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			setNotification(null)
		}, 3000)

		return () => clearTimeout(timer)
	}, [notification])

	const AnimationVariants = {
		initial: { opacity: 0, translateY: -200 },
		animate: { opacity: 1, translateY: 0 },
		exit: { opacity: 0, translateY: -200 },
		whileTap: { scale: 0.9 },
	}

	return (
		<motion.div
			className='fixed top-2 left-2/4 -translate-x-2/4 shadow-xl z-20'
			variants={AnimationVariants}
			initial='initial'
			animate='animate'
			exit='exit'
			whileTap='whileTap'
			onClick={() => setNotification(null)}
		>
			<div className='z-20 border-2 border-blue-600 py-2 px-5 rounded-lg font-semibold bg-white'>
				{notification}
			</div>
		</motion.div>
	)
}
