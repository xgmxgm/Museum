import { StrictMode } from 'react'
import './app/styles/index.css'
import App from './app/App.tsx'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
