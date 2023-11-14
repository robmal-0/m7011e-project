import React, { type ReactElement } from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout (): ReactElement {
	return <>
		<p>Layout</p>
		<Outlet />
	</>
}
