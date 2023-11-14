import React, { useState, type FormEvent, type ReactElement, useCallback } from 'react'

export default function Login (): ReactElement {
	const START_ANGLE = 135
	enum Tab {
		LOGIN, REGISTER
	}
	const [tab, setTab] = useState(Tab.LOGIN)
	const [logginIn, setLogginIn] = useState(false)
	const [angle, setAngle] = useState(START_ANGLE)

	const loadingAnim = useCallback((start: number): void => {
		const time = Number(new Date()) - start
		setAngle(START_ANGLE + (time * 0.2) % 360)
	}, [])

	const submitLogin = useCallback(async (e: FormEvent): Promise<void> => {
		setLogginIn(true)
		const form = new FormData(e.target as HTMLFormElement)
		const start = Number(new Date())
		const inter = setInterval(() => { loadingAnim(start) }, 10)
		e.preventDefault()
		const res = await fetch({
			[Tab.LOGIN]: 'http://localhost:3000/user/login',
			[Tab.REGISTER]: 'http://localhost:3000/user/register'
		}[tab], {
			method: 'POST',
			body: JSON.stringify({
				username: form.get('username'),
				password: form.get('password'),
				email: form.get('email'),
				firstName: form.get('firstName'),
				lastName: form.get('lastName'),
				age: 5
			}),
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		if (res.ok) {
			const body = await res.text()
			console.log(res)
			console.log(res.headers.get('X-User-Data'))
			console.log(body)
		} else {
			console.error(await res.text())
		}
		console.log('DONE')
		setLogginIn(false)
		window.clearInterval(inter)
		setAngle(START_ANGLE)
	}, [tab, logginIn, loadingAnim])

	return <>
		<div className='w-fit h-fit gradient gradient-rotate p-[1px] rounded-xl shadow-md shadow-black mx-auto mt-3' style={{
			backgroundImage: `linear-gradient(${angle}deg, var(--tw-gradient-stops))`
		}}>
			<div className='rounded-xl min-w-40 min-h-40 bg-gray-600 text-gray-100 overflow-clip'>
				<div className='grid grid-cols-2 border-b border-gray-400'>
					<div className={`text-center p-3 cursor-pointer ${tab === Tab.LOGIN ? 'bg-gray-500' : 'hover:bg-gray-400'}`} onClick={() => { setTab(Tab.LOGIN) }}>Login</div>
					<div className={`text-center p-3 cursor-pointer ${tab === Tab.REGISTER ? 'bg-gray-500' : 'hover:bg-gray-400'}`} onClick={() => { setTab(Tab.REGISTER) }}>Register</div>
				</div>
				<form className='px-7 py-2' onSubmit={e => { void submitLogin(e) }}>
					{{
						[Tab.LOGIN]: <>
							<p>Username</p>
							<input type='text' className='text-gray-700' autoComplete='usr_name' name='username' key='uname'/>
							<p>Password</p>
							<input type='password' className='text-gray-700' autoComplete='pwd' name='password' key='pwd'/>
						</>,
						[Tab.REGISTER]: <>
							<p>Username</p>
							<input type='text' className='text-gray-700' autoComplete='usr_name' name='username' key='uname'/>
							<p>Email</p>
							<input type='text' className='text-gray-700' autoComplete='usr_email' name='email' key='email'/>
							<p>First name</p>
							<input type='text' className='text-gray-700' autoComplete='usr_firstname' name='firstName' key='name1'/>
							<p>Last name</p>
							<input type='text' className='text-gray-700' autoComplete='usr_lastname' name='lastName' key='name2'/>
							<p>Password</p>
							<input type='password' className='text-gray-700' autoComplete='pwd' name='password' key='pwd'/>
							<p>Confirm password</p>
							<input type='password' className='text-gray-700' autoComplete='conf_pwd' name='conf_password' key='pwd2'/>
						</>
					}[tab]}
					<br />
					<div className='flex justify-end my-2'>
						<input type='submit' className='bg-orange-400 rounded px-2 py-0.5 cursor-pointer hover:bg-orange-500 disabled:bg-orange-300' disabled={logginIn}/>
					</div>
				</form>
			</div>
		</div>
	</>
}
