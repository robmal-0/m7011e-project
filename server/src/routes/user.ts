import server from '../init'
import User, { type UserType } from '../models/User'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import token_verify from '../utils/token_verify'

const userRouter = server.addGroup('user')

userRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		await User?.create({
			username: body.username,
			password: await bcrypt.hash(body.password, 10),
			email: body.email,
			age: body.age,
			firstName: body.firstName,
			lastName: body.lastName
		})
		return new Response('Successfully created user')
	} catch {
		return new Response('Failed to register user')
	}
})

userRouter.addListener('login', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	const body: any = await req.json()
	const res: any = await User?.findOne({ where: { username: body.username } })
	const user: UserType = {
		id: res.id,
		username: res.username,
		email: res.email,
		age: res.age,
		password: res.password,
		firstName: res.firstName,
		lastName: res.lastName
	}

	const verified: boolean = await bcrypt.compare(body.password, user.password)
	if (verified) {
		const headers = new Headers()
		headers.set('Set-Cookie', cookie.serialize('auth_token', jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY as string, { expiresIn: '2d' })))
		headers.set('user-data', JSON.stringify(user))
		const resp = new Response('Successfully logged in', { headers })
		return resp
	}

	return new Response('Failed to login')
})

userRouter.addListener('auth_token', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	const user = await token_verify(req)
	// console.log('test: ' + typeof user?.id)
	if (user === undefined) return new Response('Invalid auth token')
	const headers = new Headers()
	headers.set('user-data', JSON.stringify(user))
	return new Response('Success', { headers })
})

userRouter.addListener('delete', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)
	const cookies = req.headers.get('cookie') ?? ''
	const parsed = cookie.parse(cookies)
	try {
		const claims: any = jwt.verify(parsed.auth_token, process.env.SECRET_KEY as string)
		await User?.destroy({ where: { id: claims.id } })
		return new Response('Success')
	} catch {
		return new Response('Failed to verify token')
	}
})
