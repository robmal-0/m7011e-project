import express from 'express'
import { User, type UserType } from '../models'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { setCookieHeader } from '../utils/token_verify'
import { Privileges, type UserResult, getUser } from '../utils/get_user'
import { requireAdmin, requireLogin } from '../utils/auth_utils'

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
			const userRes: UserResult = {
				user,
				privileges: Privileges.USER
			}
			setCookieHeader(res, userRes)
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
				res.status(401)
				res.send('Error: user not found')
				return
			}
			if (result.bannedTill !== undefined && Number(result.bannedTill) > Number(new Date())) {
				res.status(403)
				res.send('User has been banned')
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
			console.log('body username: ' + req.body.username)
			console.log('body password: ' + req.body.password)
			console.log('user username: ' + result.user.username)
			console.log('user password: ' + result.user.password)
			res.status(500)
			res.send('Failed to login')
		})
		.catch(e => {
			console.error(e)
			res.status(500)
			res.send('Internal server error')
		})
})

userRouter.post('/auth_token', requireLogin(), (req, res) => {
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

	let whereCond

	if (req.query.username !== undefined) {
		whereCond = { username: req.query.username }
	} else {
		whereCond = {}
	}

	User.findAll({
		where: whereCond,
		attributes: ['id', 'username']
	})
		.then((found) => {
			if (found !== null && found.length !== 0) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find records')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get users')
		})
})

userRouter.patch('/:username', requireAdmin(), (req, res) => {
	// add check if user is admin, done
	// add check if user is user

	const hashPass = req.body.password !== undefined
		? bcrypt.hashSync(req.body.password, 10)
		: undefined

	User.update({
		username: req.body.username,
		email: req.body.email,
		password: hashPass,
		age: req.body.age,
		firstName: req.body.firstName,
		lastName: req.body.lastName
	}, {
		where: {
			username: req.params.username
		}
	})
		.then((saved) => {
			console.log(saved[0])
			if (saved[0] !== 0) {
				res.status(200)
				res.send('User information has been updated')
			} else {
				res.status(404)
				res.send('Could not find user')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user')
		})
})

userRouter.delete('/:username', requireAdmin(), (req, res) => {
	// add check if user is admin, done
	// add check if user is user

	User.destroy({
		where: {
			username: req.params.username
		}
	})
		.then((found) => {
			if (found !== 0) {
				res.status(200)
				res.send('User has been deleted')
			} else {
				res.status(404)
				res.send('Could not find user')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user')
		})
})

export default userRouter
