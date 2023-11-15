import express from 'express'
import User, { type UserType } from '../models/User'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
// import token_verify from '../utils/token_verify'

const userRouter = express.Router()

userRouter.post('/register', (req, res) => {
	User?.create({
		username: req.body.username,
		password: bcrypt.hashSync(req.body.password, 10),
		email: req.body.email,
		age: req.body.age,
		firstName: req.body.firstName,
		lastName: req.body.lastName
	})
		.then((result: any) => {
			const user: UserType = {
				id: result.id,
				username: result.username,
				email: result.email,
				age: result.age,
				password: result.password,
				firstName: result.firstName,
				lastName: result.lastName
			}
			const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY as string, { expiresIn: '2d' })
			res.setHeader('Set-Cookie', cookie.serialize('auth_token', token))
			res.setHeader('X-User-Data', JSON.stringify(user))
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-User-Data')
			res.status(200)
			res.send('Successfully registered user')
		})
		.catch((e) => {
			console.log(e)
			res.status(500)
			res.send('Failed to register user')
		})
})

userRouter.post('/login', (req, res) => {
	User?.findOne({ where: { username: req.body.username } }).then(async (result: any) => {
		if (result === null) {
			// new Response('Error user not found', { status: 500 })
			res.status(401)
			res.send('Error: user not found')
			return
		}
		const user: UserType = {
			id: result.id,
			username: result.username,
			email: result.email,
			age: result.age,
			password: result.password,
			firstName: result.firstName,
			lastName: result.lastName
		}

		const verified: boolean = await bcrypt.compare(req.body.password, user.password)
		if (verified) {
			const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.SECRET_KEY as string, { expiresIn: '2 h' })
			res.setHeader('Set-Cookie', cookie.serialize('auth_token', token))
			res.setHeader('X-User-Data', JSON.stringify(user))
			res.status(200)
			res.send('Successfully logged in')
			return
		}
		res.status(500)
		res.send('Failed to login')
	})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Internal server error')
		})
})

userRouter.post('/auth_token', (req, res) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	console.log(req.cookies)
	res.send('unimplemented')
	res.status(500)
	// const user = token_verify(req)
	// // console.log('test: ' + typeof user?.id)
	// if (user === undefined) return new Response('Invalid auth token')
	// const headers = new Headers()
	// headers.set('user-data', JSON.stringify(user))
	// return new Response('Success', { headers })
})

userRouter.delete('/', (req, res) => {
	// if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)
	// const cookies = req.headers.get('cookie') ?? ''
	// const parsed = cookie.parse(cookies)
	// try {
	// 	const claims: any = jwt.verify(parsed.auth_token, process.env.SECRET_KEY as string)
	// 	await User?.destroy({ where: { id: claims.id } })
	// 	return new Response('Success')
	// } catch {
	// 	return new Response('Failed to verify token')
	// }
})

export default userRouter
