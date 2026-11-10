import { Button } from 'antd'
import type { FC } from 'react'
import { Link } from 'react-router'
import { Input } from '../../shared/ui/Input'
import { useTranslation } from 'react-i18next'

export const AuthorizePage: FC = () => {
	const { t } = useTranslation()

	return (
		<div className="bg-[url('./images/mainBackground.png')] bg-cover bg-center h-screen flex justify-center">
			<div className='w-10/12 flex justify-center items-center'>
				<div className='bg-custom-black  p-10 rounded-xl'>
					<form className='flex flex-col gap-5 w-80'>
						<p className='text-xl mb-8'>{t('signIn')}</p>
						<Input type='text' placeholder={t('email') + '...'} />
						<Input type='text' placeholder={t('password') + '...'} />
						<Button className='mt-8'>{t('signIn')}</Button>
						<Link to='/'>{t('backToHome')}</Link>
					</form>
				</div>
			</div>
		</div>
	)
}
