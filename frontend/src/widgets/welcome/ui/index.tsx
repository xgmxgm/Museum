import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export const Welcome: FC = () => {
    const { t } = useTranslation()

    const text = t('greatFiguresOfTheKazakhPeople')

    return (
        <div className='bg-welcome-img bg-cover h-screen bg-center flex items-center justify-center'>
            <div className='w-10/12 flex items-center'>
                <div className='w-full md:w-5/6 mt-60'>
                    <motion.p
                        className='text-2xl font-bold font-serif text-wrap md:text-7xl overflow-hidden'
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{
                            duration: 3,
                            ease: 'linear',
                        }}
                        style={{
                            whiteSpace: 'normal',
                        }}
                    >
                        {text}
                    </motion.p>
                </div>
            </div>
        </div>
    )
}