import { type RequestHandler } from 'express'
import { setCookieHeader, verifyToken } from './token_verify'
import { Privileges } from './get_user'

interface Options {
	setToken?: boolean
}

export function requireLogin (options?: Options): RequestHandler {
	return (req, res, next) => {
		verifyToken(req.cookies.auth_token)
			.then((result) => {
				if (result === undefined) {
					res.status(403)
					res.send('User not found')
					return
				}
				if (options?.setToken === undefined || options.setToken) setCookieHeader(res, result)
				res.setHeader('X-User-Data', JSON.stringify(result.user))
				res.setHeader('X-User-Privilege', JSON.stringify(result.privileges))
				next()
			})
			.catch(e => {
				res.status(403)
				res.send('Access denied')
			})
	}
}

export function requireAdmin (options?: Options): RequestHandler {
	return (req, res, next) => {
		verifyToken(req.cookies.auth_token)
			.then((result) => {
				if (result === undefined || result.privileges < Privileges.ADMIN) {
					res.status(403)
					res.send('Access denied')
					return
				}
				if (options?.setToken === undefined || options.setToken) setCookieHeader(res, result)
				res.setHeader('X-User-Data', JSON.stringify(result.user))
				next()
			})
			.catch(e => {
				res.status(403)
				res.send('Access denied')
			})
	}
}
