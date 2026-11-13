import { Button } from 'antd'
import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Input } from '../../../../shared/ui/Input'
import { useAuthContext } from '../../../../features/Auth/context'

interface IProps {
	setIsSignIn: (isSignIn: boolean) => void
}

export const SignIn: FC<IProps> = ({ setIsSignIn }) => {
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const { loginWithEmailAndPassword } = useAuthContext()
	const { t } = useTranslation()

	const handleSingIn = () => {
		loginWithEmailAndPassword(email, password, setIsLoading)
	}

	return (
		<form className='flex flex-col gap-5 w-80'>
			<p className='text-xl mb-8'>{t('signIn')}</p>
			<Input
				value={email}
				onChange={e => setEmail(e.target.value)}
				type='text'
				placeholder={t('email') + '...'}
			/>
			<Input
				value={password}
				onChange={e => setPassword(e.target.value)}
				type='text'
				placeholder={t('password') + '...'}
			/>
			<Button disabled={isLoading} className='mt-8' onClick={handleSingIn}>
				{t('signIn')}
			</Button>
			<div className='flex justify-between'>
				<Link to='/'>{t('backToHome')}</Link>
				<p onClick={() => setIsSignIn(false)} className='cursor-pointer'>
					{t('signUp')}
				</p>
			</div>
		</form>
	)
}
