import { useState, type FC, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuthContext } from '../../features/Auth/context'

export const AccountPage: FC = () => {
	const { user, isAuth, changePassword, deleteAccount, logout } = useAuthContext()
	const navigate = useNavigate()
	const [oldPassword, setOldPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [message, setMessage] = useState('')
	const [busy, setBusy] = useState(false)
	const submitPassword = async (event: FormEvent) => {
		event.preventDefault(); setBusy(true); setMessage('')
		try { await changePassword(oldPassword, newPassword); setOldPassword(''); setNewPassword(''); setMessage('Пароль успешно изменён') }
		catch { setMessage('Не удалось изменить пароль. Проверьте старый пароль и требования к новому.') }
		finally { setBusy(false) }
	}
	const removeAccount = async () => {
		if (!window.confirm('Удалить аккаунт без возможности восстановления?')) return
		try { await deleteAccount(); navigate('/') } catch { setMessage('Не удалось удалить аккаунт') }
	}
	if (!isAuth) return <main className='min-h-screen px-6 pt-32 text-center'><p>Войдите, чтобы управлять аккаунтом.</p><Link to='/authorize' className='mt-4 inline-block text-[#d7a769]'>Войти</Link></main>
	return <main className='min-h-screen px-5 pb-20 pt-32'><div className='mx-auto max-w-2xl space-y-6'><header><p className='eyebrow'>Аккаунт</p><h1 className='mt-3 text-4xl font-semibold'>{user?.user.username}</h1><p className='mt-2 text-white/60'>{user?.user.email}</p></header>
		{message && <p role='status' className='rounded-xl border border-[#d7a769]/30 bg-[#d7a769]/10 p-4'>{message}</p>}
		<form onSubmit={submitPassword} className='grid gap-4 rounded-2xl border border-white/10 bg-[#20231f] p-6'><h2 className='text-xl font-semibold'>Сменить пароль</h2><input required minLength={8} type='password' autoComplete='current-password' placeholder='Текущий пароль' value={oldPassword} onChange={event => setOldPassword(event.target.value)} className='rounded-lg border border-white/10 bg-[#171a17] p-3' /><input required minLength={8} type='password' autoComplete='new-password' placeholder='Новый пароль (не менее 8 символов)' value={newPassword} onChange={event => setNewPassword(event.target.value)} className='rounded-lg border border-white/10 bg-[#171a17] p-3' /><button disabled={busy} className='w-fit rounded-full bg-[#e9e1d2] px-5 py-3 font-semibold text-[#171a17] disabled:opacity-50'>Обновить пароль</button></form>
		<div className='flex flex-wrap gap-3'><button onClick={() => void logout()} className='rounded-full border border-white/20 px-5 py-3'>Выйти из аккаунта</button><button onClick={removeAccount} className='rounded-full border border-red-300/40 px-5 py-3 text-red-200'>Удалить аккаунт</button></div>
		</div></main>
}
