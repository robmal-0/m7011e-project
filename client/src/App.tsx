import React, { type ReactElement } from 'react'
import './App.css'
import { Route, Routes } from 'react-router'
import { BrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Login from './routes/Login'
import Index from './routes/Index'

export default function App (): ReactElement {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Layout />}>
					<Route index element={<Index />}/>
					<Route path='login' element={<Login />}/>
				</Route>
			</Routes>
		</BrowserRouter>
	)
}
