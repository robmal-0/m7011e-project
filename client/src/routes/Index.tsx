import React, { type ReactElement } from 'react'
import Authorized from '../Authorized'

export default function Index (): ReactElement {
	// const user = useSelector((state: any) => state.currentUser)

	// useEffect(() => {
	// 	if (user.user === undefined) {
	// 		history.pushState({}, '', '/login')
	// 		history.go()
	// 	}
	// }, [])

	return <Authorized>
		<p>Index</p>
	</Authorized>
}
