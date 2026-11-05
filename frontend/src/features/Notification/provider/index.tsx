import { AnimatePresence } from 'framer-motion'
import { NotificationContext } from '../context'
import { Notification } from '../ui/notification'
import { useState, type FC, type PropsWithChildren } from 'react'

export const NotificationProvider: FC<PropsWithChildren> = ({ children }) => {
	const [notification, setNotification] = useState<null | string>(null)

	return (
		<NotificationContext.Provider value={{ notification, setNotification }}>
			<AnimatePresence>
				{notification && (
					<Notification
						notification={notification}
						setNotification={setNotification}
					/>
				)}
			</AnimatePresence>
			{children}
		</NotificationContext.Provider>
	)
}
