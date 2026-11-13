import { useState, type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '../../../../shared/ui/Input'
import { Button } from 'antd'
import { Link } from 'react-router'
import { useAuthContext } from '../../../../features/Auth/context'

interface IProps {
	setIsSignIn: (isSignIn: boolean) => void
}

export const SignUp: FC<IProps> = ({ setIsSignIn }) => {
	const [userName, setUserName] = useState<string>('')
	const [email, setEmail] = useState<string>('')
	const [password, setPassword] = useState<string>('')
	const [repeatPassword, setRepeatPassword] = useState<string>('')

	const [isLoading, setIsLoading] = useState<boolean>(false)

	const { registerUserWithEmailAndPassword } = useAuthContext()

	const { t } = useTranslation()

	const handleSingUp = () => {
		registerUserWithEmailAndPassword(
			userName,
			email,
			password,
			repeatPassword,
			setIsLoading,
		)
	}

	return (
		<form className='flex flex-col gap-5 w-80'>
			<p className='text-xl mb-8'>{t('signUp')}</p>
			<Input
				value={userName}
				onChange={e => setUserName(e.target.value)}
				type='text'
				placeholder={t('userName') + '...'}
			/>
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
			<Input
				value={repeatPassword}
				onChange={e => setRepeatPassword(e.target.value)}
				type='text'
				placeholder={t('repeatPassword') + '...'}
			/>
			<Button disabled={isLoading} className='mt-8' onClick={handleSingUp}>
				{t('signIn')}
			</Button>
			<div className='flex justify-between'>
				<Link to='/'>{t('backToHome')}</Link>
				<p onClick={() => setIsSignIn(true)} className='cursor-pointer'>
					{t('signIn')}
				</p>
			</div>
		</form>
	)
}
