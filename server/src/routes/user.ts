import server from '../init'
import User from '../models/User'
import { sha256 } from 'js-sha256'

const userRouter = server.addGroup('user')

userRouter.addListener('register', async (req): Promise<Response> => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)
	try {
		const body = await req.json()
		await User?.create({
			username: body.username,
			password: sha256(body.password),
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
