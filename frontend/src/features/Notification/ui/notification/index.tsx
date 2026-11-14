import { motion } from 'framer-motion'
import { useEffect, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import type { INotificationContext } from '../../type'

export const Notification: FC<INotificationContext> = ({
	setNotification,
	notification,
}) => {
	const { t } = useTranslation()

	useEffect(() => {
		const timer = setTimeout(() => {
			setNotification(null)
		}, 4000)

		return () => clearTimeout(timer)
	}, [notification])

	const AnimationVariants = {
		initial: { opacity: 0, translateY: -200, scale: 0 },
		animate: { opacity: 1, translateY: 0, scale: 1 },
		exit: { opacity: 0, translateY: -200 },
		whileTap: { scale: 0.9 },
		whileHover: { scale: 1.1 },
	}

	return (
		<motion.div
			className='fixed top-2 left-2/4 -translate-x-2/4 shadow-xl z-20'
			variants={AnimationVariants}
			initial='initial'
			animate='animate'
			exit='exit'
			whileHover='whileHover'
			whileTap='whileTap'
			onClick={() => setNotification(null)}
		>
			<div className='z-20 glass-effect py-2 px-5 rounded-lg font-semibold shadow-2xl'>
				<p>{notification ? t(notification) : notification}</p>
			</div>
		</motion.div>
	)
}
