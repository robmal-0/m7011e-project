import express from 'express'
import User, { type UserType } from '../models/User'
import BannedUser from '../models/BannedUser'
import Moderator, { type ModeratorType } from '../models/Moderator'
import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { verifyToken, verifyAdmin, setCookieHeader } from '../utils/token_verify'

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
			setCookieHeader(res, user)
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
	verifyToken(req.cookies.auth_token)
		.then((user) => {
			if (user !== undefined) {
				setCookieHeader(res, user)
				res.setHeader('X-User-Data', JSON.stringify(user))
				res.status(200)
				res.send('Successfully verified token')
				return
			}

			res.status(401)
			res.send('Failed to verify token')
		})
		.catch(() => {
			res.status(401)
			res.send('Failed to verify token')
		})
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

// ------------------------------------------------------------
// ----- /user/banned/ -----

userRouter.get('/:uId/banned/', (req, res) => {
	// add check user is admin

	BannedUser.findAll({
		where: {
			userId: req.params.uId
		}
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find banned user')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about banned user')
		})
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.post('/banned/', async (req, res) => {
	function banUser (): void {
		BannedUser?.findOrCreate({
			where: {
				userId: req.body.userId,
				unbanDate: req.body.unbanDate
			}
		})
			.then(([user, created]) => {
				if (created) {
					res.status(201)
					res.send('Successfully banned user until ' + req.body.unbanDate)
				} else {
					res.status(200)
					res.send('User already banned until ' + req.body.unbanDate)
				}
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to ban user')
			})
	}

	const admin = await verifyAdmin(req.cookies.auth_token)

	if (admin) {
		banUser()
	} else {
		res.status(500)
		res.send('User is not an admin')
	}
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.delete('/:uId/banned/', async (req, res) => {
	// check if user is logged in
	// check if user is an admin

	function unbanUser (): void {
		BannedUser.destroy({
			where: { userId: req.params.uId }
		})
			.then((result) => {
				if (result === 1) {
					res.status(200)
					res.send('User successfully unbanned')
				} else {
					res.status(404)
					res.send('User could not be found among banned users')
				}
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to unban user')
			})
	}

	const admin = await verifyAdmin(req.cookies.auth_token)

	if (admin) {
		unbanUser()
	} else {
		res.status(500)
		res.send('User is not an admin')
	}
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
userRouter.patch('/:uId/banned/', async (req, res) => {
	// check if user is logged in
	// check if user is an admin

	function unbanUser (): void {
		BannedUser.update(req.body, {
			where: { userId: req.params.uId }
		})
			.then((saved) => {
				if (saved[0] === 1) {
					res.status(200)
					res.send('Ban information was updated')
				} else {
					res.status(404)
					res.send('Ban information could not be found')
				}
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to update information about banned user')
			})
	}

	const admin = await verifyAdmin(req.cookies.auth_token)

	if (admin) {
		unbanUser()
	} else {
		res.status(500)
		res.send('User is not an admin')
	}
})

// ------------------------------------------------------------
// ----- /user/moderator/ -----

userRouter.post('/:uId/moderator', (req, res) => {
	// add check user is admin
	// add check that user being promoted is not banned

	Moderator.findOrCreate({
		where: {
			userId: req.params.uId
		}
	})
		.then(([user, created]) => {
			if (created) {
				res.status(201)
				res.send('User has been promoted to moderator status')
			} else {
				res.status(200)
				res.send('User was already a moderator')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to make user a moderator')
		})
})

userRouter.delete('/:uId/Moderator', (req, res) => {
	// add check user is admin

	Moderator.destroy({
		where: { userId: req.params.uId }
	})
		.then((result) => {
			if (result === 1) {
				res.status(200)
				res.send('User is no longer a moderator')
			} else {
				res.status(404)
				res.send('User could not be found among moderator')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to remove user from moderators')
		})
})

userRouter.get('/:uId/Moderator', (req, res) => {
	// add check user is admin

	Moderator.findOne({
		where: { userId: req.params.uId }
	})
		.then((found: any) => {
			const moderator: ModeratorType = found
			// find information about this moderator
			if (found !== null) {
				User.findOne({
					where: { id: moderator.userId }
				})
					.then((found) => {
						if (found !== null) {
							res.status(200)
							res.send(found)
						} else {
							res.status(404)
							res.send('User could not be found')
						}
					})
					.catch((e) => {
						console.error(e)
						res.status(500)
						res.send('Failed to search for user')
					})
			} else {
				res.status(404)
				res.send('Moderator could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to search for moderator')
		})
})

export default userRouter
