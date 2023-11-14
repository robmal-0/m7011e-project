import React from 'react'
import ReactDOM from 'react-dom/client'
// import './index.css'
import App from './App'
import { CookiesProvider } from 'react-cookie'
import { configureStore } from '@reduxjs/toolkit'
import { reducers } from './store'
import { Provider } from 'react-redux'

const store = configureStore({
	reducer: reducers
})

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
)

root.render(
	<CookiesProvider>
		<Provider store={store}>
			<React.StrictMode>
				<App />
			</React.StrictMode>
		</Provider>
	</CookiesProvider>
)
