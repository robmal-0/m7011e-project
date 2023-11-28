import User, { type UserType } from '../models/User'
import Admin from '../models/Admin'
import jwt from 'jsonwebtoken'
import { type Response } from 'express'
import cookie from 'cookie'

export async function verifyToken (token: string): Promise<UserType | undefined> {
	try {
		const claims = jwt.verify(token, process.env.SECRET_KEY as string) as unknown as claims

		const res: any = await User?.findOne({ where: { id: claims.id } })
		const user: UserType = {
			id: res.id,
			username: res.username,
			email: res.email,
			age: res.age,
			password: res.password,
			firstName: res.firstName,
			lastName: res.lastName
		}

		return user
	} catch {
		return undefined
	}
}

// need something to check if user is banned

export async function verifyLogin (token: string, userId: number): Promise<[boolean, boolean]> { // [if user is defined, if id matches]
	const userInfo = await verifyToken(token)

	if (typeof userInfo !== 'undefined') {
		if (userInfo.id === userId) {
			return [true, true]
		} else {
			return [true, false]
		}
	} else {
		return [false, false]
	}
}

export async function verifyAdmin (token: string): Promise<boolean> {
	const claims = jwt.verify(token, process.env.SECRET_KEY as string) as unknown as claims

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

export function setCookieHeader (res: Response, user: UserType): void {
	const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY as string, { expiresIn: '2 h' })
	res.setHeader('Set-Cookie', cookie.serialize('auth_token', token, { expires: new Date(Number(new Date()) + 1000 * 60 * 60 * 24), path: '/', domain: 'localhost' }))
}
