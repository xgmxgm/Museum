import { useEffect, useState, type FC } from 'react'
import { SignIn } from './ui/signIn'
import { SignUp } from './ui/signUp'
import { useAuthContext } from '../../features/Auth/context'
import { useNavigate } from 'react-router'

export const AuthorizePage: FC = () => {
	const [isSignIn, setIsSignIn] = useState<boolean>(true)

	const { isAuth } = useAuthContext()
	const navigate = useNavigate()

	useEffect(() => {
		if (isAuth) navigate('/')
	}, [isAuth])

	return (
		<div className='auth-backdrop min-h-screen flex justify-center'>
			<div className='w-10/12 flex justify-center items-center'>
				<div className='bg-[#171a17]/90 border border-white/10 backdrop-blur-xl p-7 md:p-10 rounded-2xl shadow-2xl shadow-black/30'>
					{isSignIn ? (
						<SignIn setIsSignIn={setIsSignIn} />
					) : (
						<SignUp setIsSignIn={setIsSignIn} />
					)}
				</div>
			</div>
		</div>
	)
}
