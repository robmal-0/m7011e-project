import User, { type UserType } from '../models/User'
import Admin from '../models/Admin'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

export default async function verifyInfo (req: Request): Promise<UserType | undefined> {
	const cookies = req.headers.get('cookie') ?? ''
	const parsed = cookie.parse(cookies)
	try {
		const claims = jwt.verify(parsed.auth_token, process.env.SECRET_KEY as string) as unknown as claims

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

export async function verifyLogin (req: Request, userId: number): Promise<[boolean, boolean]> { // [if user is defined, if id matches]
	const userInfo = await verifyInfo(req)

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

export async function verifyAdmin (req: Request): Promise<boolean> {
	const cookies = req.headers.get('cookie') ?? ''
	const parsed = cookie.parse(cookies)

	const claims = jwt.verify(parsed.auth_token, process.env.SECRET_KEY as string) as unknown as claims

	return await Admin?.count({ where: { userId: claims.id } })
		.then(count => {
			if (count !== 0) {
				return true
			} else {
				return false
			}
		})
}
