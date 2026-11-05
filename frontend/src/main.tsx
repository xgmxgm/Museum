import { StrictMode } from 'react'
import './app/styles/index.css'
import App from './app/App.tsx'
import { createRoot } from 'react-dom/client'
import { NotificationProvider } from './features/Notification/provider/index.tsx'
import { AuthProvider } from './features/Auth/provider/index.tsx'
import './app/i18n.ts'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<NotificationProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</NotificationProvider>
	</StrictMode>,
)
