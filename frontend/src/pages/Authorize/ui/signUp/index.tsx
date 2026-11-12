import { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/ui/Input'
import { Button } from 'antd'
import { Link } from 'react-router'

interface IProps {
	setIsSignIn: (isSignIn: boolean) => void
}

export const SignUp: FC<IProps> = ({ setIsSignIn }) => {
	const { t } = useTranslation()

	return (
		<form className='flex flex-col gap-5 w-80'>
			<p className='text-xl mb-8'>{t('signUp')}</p>
			<Input type='text' placeholder={t('email') + '...'} />
			<Input type='text' placeholder={t('password') + '...'} />
			<Input type='text' placeholder={t('repeatPassword') + '...'} />
			<Button className='mt-8'>{t('signIn')}</Button>
			<div className='flex justify-between'>
				<Link to='/'>{t('backToHome')}</Link>
				<p onClick={() => setIsSignIn(true)} className='cursor-pointer'>
					{t('signIn')}
				</p>
			</div>
		</form>
	)
}
