import User, { type UserType } from '../models/User'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

export default async function (req: Request): Promise<UserType | undefined> {
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
