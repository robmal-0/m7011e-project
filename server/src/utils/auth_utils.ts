import { type RequestHandler } from 'express'
import { setCookieHeader, verifyToken } from './token_verify'
import { Privileges, type UserResult } from './get_user'
import { Moderator } from '../models'

interface Options {
	setToken?: boolean
}

export function requireLogin (options?: Options): RequestHandler {
	return (req, res, next) => {
		verifyToken(req.cookies.auth_token)
			.then((result) => {
				if (result === undefined) {
					throw new Error('User not found')
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
					throw new Error('Not admin')
				}
				if (options?.setToken === undefined || options.setToken) setCookieHeader(res, result)
				res.setHeader('X-User-Data', JSON.stringify(result.user))
				res.setHeader('X-User-Privilege', JSON.stringify(result.privileges))
				next()
			})
			.catch(e => {
				console.error(e)
				res.status(403)
				res.send('Access denied')
			})
	}
}

interface ModOptions extends Options {
	allowAdmin?: boolean
}

export function requireModerator (courseParam: string, options?: ModOptions): RequestHandler {
	return (req, res, next) => {
		verifyToken(req.cookies.auth_token)
			.then(async (result) => {
				if (result === undefined || result.privileges < Privileges.MODERATOR) {
					throw new Error('Not moderator')
				}
				const mod = await Moderator.findOne({ where: { userId: result.user.id, courseId: req.params[courseParam] } })
				if (mod == null && (result.privileges < Privileges.ADMIN || !(options?.allowAdmin ?? true))) {
					throw new Error('Not moderator of course')
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

export async function isModerator (user: UserResult, courseId: number): Promise<boolean> {
	if (user.privileges < Privileges.MODERATOR) return false
	if (user.privileges >= Privileges.ADMIN) return true

	const mod = await Moderator.findOne({ where: { userId: user.user.id, courseId } })
	return mod !== null
}

export function getUserInfo (res: any): UserResult {
	return {
		user: JSON.parse(res.getHeader('X-User-Data')),
		privileges: Number(res.getHeader('X-User-Privilege'))
	}
}
