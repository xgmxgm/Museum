import { createContext, useContext } from 'react'
import type { INotificationContext } from '../type'

export const NotificationContext = createContext<INotificationContext>({
	notification: null,
	setNotification: () => {},
})

export const useNotificationContext = () => {
	return useContext<INotificationContext>(NotificationContext)
}