import React, { useEffect, useState, type ReactElement } from 'react'
import { useCookies } from 'react-cookie'
import { useSelector, useDispatch } from 'react-redux'
import { actions } from './store'
import { useNavigate } from 'react-router-dom'

export default function Authorized (props: any): ReactElement {
	const user = useSelector((state: any) => state.currentUser)
	const userDispatcher = useDispatch()
	const [checked, setChecked] = useState(false)
	const [authorized, setAuthorized] = useState(false)
	const [cookies] = useCookies(['auth_token'])
	const navigate = useNavigate()

	useEffect(() => {
		(async () => {
			setAuthorized(user.user !== undefined)
			if (user.user === undefined) {
				if (cookies.auth_token) {
					const res = await fetch('http://localhost:3000/user/auth_token', {
						method: 'POST',
						credentials: 'include'
					})
					setChecked(true)
					if (res.ok) {
						let user_data = JSON.parse(res.headers.get('X-User-Data') ?? '');
						let action = actions.userActions.setUser(user_data)
						userDispatcher(action)
						setAuthorized(true)
						return
					}
				}
				navigate('/login')
			} else {
				setChecked(true)
			}
		})()
	}, [])

	return <>
		{ checked
			? <>
				{
					authorized
						? <> { props.children } </>
						: <p>Unauthorized</p>
				}
			</>
			: <p>Authorizing...</p>
		}
	</>
}
