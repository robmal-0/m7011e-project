import React, { useEffect, useState, type ReactElement } from 'react'
import { useSelector } from 'react-redux'

export default function Authorized (props: any): ReactElement {
	const user = useSelector((state: any) => state.currentUser)
	const [checked, setChecked] = useState(false)
	const [authorized, setAuthorized] = useState(false)

	useEffect(() => {
		setAuthorized(user.user !== undefined)
		setChecked(true)
		if (user.user === undefined) {
			history.pushState({}, '', '/login')
			history.go()
		}
	})

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
