import server from '../init'
import User from '../models/User'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'

const key = 'other_key'
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
	const user: any = await User?.findOne({ where: { username: body.username } })

	const verified: boolean = await bcrypt.compare(body.password, user?.password)
	if (verified) {
		const headers = new Headers()
		headers.set('Set-Cookie', cookie.serialize('auth_token', jwt.sign({ id: user?.id, username: user?.username, email: user?.email }, key)))
		const resp = new Response('Successfully logged in', { headers })
		return resp
	}

	return new Response('Failed to login')
})

userRouter.addListener('auth_token', async (req) => {
	const cookies = req.headers.get('cookie') ?? ''
	const parsed = cookie.parse(cookies)
	try {
		const res = jwt.verify(parsed.auth_token, key)
		return new Response('Success')
	} catch {
		return new Response('Failed to verify token')
	}
})
