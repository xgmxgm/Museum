import { useState, type FC } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Logo } from '../../../shared/ui/Logo'
import { IoExitOutline, IoMenu, IoClose } from 'react-icons/io5'
import { useAuthContext } from '../../../features/Auth/context'

export const MobileHeader: FC = () => {
	const { isAuth, user, logout } = useAuthContext()
	const { t, i18n } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const changeLanguage = (lng: string) => {
		i18n.changeLanguage(lng)
		setIsOpen(false)
	}

	const handleLogout = () => {
		logout()
		setIsOpen(false)
	}

	return (
		<motion.div
			initial={{ y: -100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{
				duration: 0.6,
				ease: [0.22, 1, 0.36, 1],
			}}
			className='w-full fixed top-0 flex justify-center z-10'
		>
			<div className='w-11/12 p-4 rounded-b-lg glass-effect'>
				<div className='flex items-center justify-between'>
					<Link to='/' onClick={() => setIsOpen(false)}>
						<Logo />
					</Link>

					<button
						type='button'
						onClick={() => setIsOpen(!isOpen)}
						className='text-3xl cursor-pointer'
					>
						{isOpen ? <IoClose /> : <IoMenu />}
					</button>
				</div>

				<AnimatePresence>
					{isOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.3, ease: 'easeInOut' }}
							className='overflow-hidden'
						>
							<div className='flex flex-col gap-5 border-t border-white/20 pt-4 mt-5'>
								{isAuth ? (
									<>
										<p className='font-semibold'>{user?.user.username}</p>

										<button
											type='button'
											onClick={handleLogout}
											className='flex items-center gap-2 cursor-pointer'
										>
											{t('exit')}
											<IoExitOutline size={20} />
										</button>
									</>
								) : (
									<Link to='/Authorize' onClick={() => setIsOpen(false)}>
										{t('signIn')}
									</Link>
								)}

								<div className='flex items-center gap-3'>
									<button
										onClick={() => changeLanguage('kz')}
										className={`cursor-pointer ${
											i18n.language === 'kz'
												? 'font-bold text-white'
												: 'text-gray-400'
										}`}
									>
										KZ
									</button>

									<button
										onClick={() => changeLanguage('ru')}
										className={`cursor-pointer ${
											i18n.language === 'ru'
												? 'font-bold text-white'
												: 'text-gray-400'
										}`}
									>
										RU
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	)
}
