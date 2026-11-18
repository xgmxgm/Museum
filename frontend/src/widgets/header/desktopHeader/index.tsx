import { type FC } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Logo } from '../../../shared/ui/Logo'
import { IoExitOutline } from 'react-icons/io5'
import { Select } from '../../../shared/ui/Select'
import { useAuthContext } from '../../../features/Auth/context'

export const DesktopHeader: FC = () => {
	const { isAuth, user, logout } = useAuthContext()

	const { t, i18n } = useTranslation()

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
	}

	return (
		<motion.div
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			}}
			className='site-header w-full flex items-center justify-center fixed z-10'
		>
			<div className='px-2 py-4 md:py-5 w-11/12 max-w-[1440px] flex items-center justify-between'>
				<Link to='/'>
					<Logo />
				</Link>
				<div className='flex gap-6 justify-center items-center text-sm'>
					{isAuth ? (
						<div className='flex items-center justify-center gap-5'>
							<p>{user?.user.username}</p>
							<button
								className='cursor-pointer flex items-center gap-2 hover:text-[#d7a769] transition-colors'
								onClick={() => logout()}
							>
								{t('exit')}
								<IoExitOutline size={20} />
							</button>
						</div>
					) : (
						<Link className='rounded-full border border-white/20 px-5 py-2.5 hover:bg-white/10 transition-colors' to={{ pathname: '/Authorize' }}>{t('signIn')}</Link>
					)}
					<Select
						defaultValue='kz'
						onChange={e => changeLanguage(e.target.value)}
						options={[
							{ value: 'kz', label: 'KZ' },
							{ value: 'ru', label: 'RU', selected: true },
						]}
					/>
				</div>
			</div>
		</motion.div>
	)
}
