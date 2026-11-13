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
		<div className="bg-[url('./images/mainBackground.png')] bg-cover bg-center h-screen flex justify-center">
			<div className='w-10/12 flex justify-center items-center'>
				<div className='bg-custom-black  p-10 rounded-xl'>
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
