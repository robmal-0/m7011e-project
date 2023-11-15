import React, { type ReactElement } from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout (): ReactElement {
	return <>
		<main className='grid h-screen overflow-hidden w-screen grid-rows-[auto_1fr]'>
			<header className='pb-[2px] text-white bg-gradient-to-r gradient shadow-sm shadow-black z-10'>
				<div className='bg-gray-700 px-4 py-2'>
					<p className='text-3xl'>Site name</p>
				</div>
			</header>
			<div className='bg-gray-500 z-0'>
				<Outlet />
			</div>
		</main>
	</>
}
