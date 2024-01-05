import Admin from '../models/Admin'
import jwt from 'jsonwebtoken'
import { type Response } from 'express'
import cookie from 'cookie'
import { getUser, type UserResult } from './get_user'

export async function verifyToken (token: string): Promise<UserResult | undefined> {
	try {
		const claims = jwt.verify(token, process.env.SECRET_KEY as string) as unknown as claims

		const user = await getUser('id', claims.id)

		return user
	} catch {
		return undefined
	}
}

// need something to check if user is banned

export async function verifyLogin (token: string, userId: number): Promise<[boolean, boolean]> { // [if user is defined, if id matches]
	const userInfo = await verifyToken(token)

	if (typeof userInfo !== 'undefined') {
		if (userInfo.user.id === userId) {
			return [true, true]
		} else {
			return [true, false]
		}
	} else {
		return [false, false]
	}
}

export async function verifyAdmin (token: string): Promise<boolean> {
	const claims: any = jwt.verify(token, process.env.SECRET_KEY as string) as unknown as claims

	return await Admin?.count({ where: { userId: claims.id } })
		.then(count => {
			if (count === 1) {
				return true
			} else {
				return false
			}
		})
		.catch((e) => {
			console.error(e)
			return false
		})
}

export function setCookieHeader (res: Response, result: UserResult): void {
	const token = jwt.sign(
		{
			id: result.user.id,
			username: result.user.username,
			email: result.user.email,
			privilages: result.privileges
		},
		process.env.SECRET_KEY as string,
		{ expiresIn: '2 h' }
	)
	res.setHeader('Set-Cookie', cookie.serialize(
		'auth_token',
		token,
		{
			expires: new Date(Number(new Date()) + 1000 * 60 * 60 * 24),
			path: '/'
		}
	))
}
