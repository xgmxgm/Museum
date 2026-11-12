import { Button } from 'antd'
import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Input } from '../../../../shared/ui/Input'

interface IProps {
	setIsSignIn: (isSignIn: boolean) => void
}

export const SignIn: FC<IProps> = ({ setIsSignIn }) => {
	const { t } = useTranslation()

	return (
		<form className='flex flex-col gap-5 w-80'>
			<p className='text-xl mb-8'>{t('signIn')}</p>
			<Input type='text' placeholder={t('email') + '...'} />
			<Input type='text' placeholder={t('password') + '...'} />
			<Button className='mt-8'>{t('signIn')}</Button>
			<div className='flex justify-between'>
				<Link to='/'>{t('backToHome')}</Link>
				<p onClick={() => setIsSignIn(false)} className='cursor-pointer'>{t('signUp')}</p>
			</div>
		</form>
	)
}
