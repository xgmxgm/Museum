import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FiArrowDownRight } from 'react-icons/fi'

export const Welcome: FC = () => {
	const { t } = useTranslation()

	const text = t('greatFiguresOfTheKazakhPeople')

	return (
		<section className='hero-photo relative min-h-185 h-[94svh] max-h-270 flex items-end overflow-hidden'>
			<div
				className='absolute inset-0 opacity-20 pointer-events-none'
				style={{
					backgroundImage:
						'radial-gradient(rgba(255,255,255,.35) .65px, transparent .65px)',
					backgroundSize: '5px 5px',
				}}
			/>
			<div className='relative z-1 w-11/12 max-w-360 mx-auto pb-20 md:pb-28 pt-36'>
				<motion.div
					initial={{ opacity: 0, y: 22 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className='max-w-4xl'
				>
					<p className='eyebrow mb-6'>
						{t('heroKicker')}{' '}
						<span className='text-white/60 tracking-normal normal-case ml-2'>
							/ {t('heroTagline')}
						</span>
					</p>
					<motion.p
						className='text-[clamp(3.4rem,9vw,8.5rem)] leading-[.94] font-medium tracking-[-.065em] text-wrap max-w-5xl'
						initial={{ opacity: 0, y: 25 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
					>
						{text}
					</motion.p>
					<div className='mt-8 flex flex-col sm:flex-row sm:items-center gap-6'>
						<p className='text-sm md:text-base text-white/75 max-w-md leading-7'>
							{t('heroSubtitle')}
						</p>
						<a
							href='#museums'
							className='group inline-flex items-center gap-4 rounded-full bg-[#e9e1d2] text-[#171a17] font-bold px-6 py-4 hover:bg-[#d7a769] transition-colors'
						>
							{t('heroCta')}{' '}
							<FiArrowDownRight className='text-xl transition-transform group-hover:translate-x-1 group-hover:translate-y-1' />
						</a>
					</div>
				</motion.div>
				<div className='absolute right-0 bottom-16 hidden lg:flex items-center gap-3 text-xs tracking-[.16em] text-white/65'>
					<span className='w-10 h-px bg-[#d7a769]' /> {t('heroFootnote')}
				</div>
			</div>
			<div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#151714] to-transparent' />
		</section>
	)
}
