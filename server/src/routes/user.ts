import express from 'express'
import User, { type UserType } from '../models/User'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { setCookieHeader } from '../utils/token_verify'
import { getUser } from '../utils/get_user'
import { requireLogin } from '../utils/auth_utils'

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
			res.status(201)
			res.send('Successfully registered user')
		})
		.catch((e) => {
			console.log(e)
			res.status(500)
			res.send('Failed to register user')
		})
})

userRouter.post('/login', (req, res) => {
	getUser('username', req.body.username)
		.then(async (result) => {
			if (result === undefined) {
				// new Response('Error user not found', { status: 500 })
				res.status(401)
				res.send('Error: user not found')
				return
			}
			const verified: boolean = await bcrypt.compare(req.body.password, result.user.password)
			if (verified) {
				setCookieHeader(res, result)
				res.setHeader('X-User-Data', JSON.stringify(result.user))
				res.status(200)
				res.send('Successfully logged in')
				return
			}
			res.status(500)
			res.send('Failed to login')
		})
		.catch(e => {
			console.error(e)
			res.status(500)
			res.send('Internal server error')
		})
})

userRouter.use('/auth_token', requireLogin())
userRouter.post('/auth_token', (req, res) => {
	res.status(200)
	res.send('Successfully verified token')
})

userRouter.delete('/', (req, res) => {
	// if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)
	// const cookies = req.headers.get('cookie') ?? ''
	// const parsed = cookie.parse(cookies)
	try {
		const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
		User?.destroy({ where: { id: claims.id } })
			.then(() => {
				res.status(200)
				res.send('Successfully deleted user')
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to delete user')
			})
	} catch {
		res.status(500)
		res.send('Failed to retrieve user from token')
	}
})

userRouter.get('/', (req, res) => {
	// maybe add check for logged in?

	User.findAll({
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find requested record')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to find course')
		})
})

export default userRouter
