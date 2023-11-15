import express from 'express'
import BannedUser from '../models/BannedUser'
import { verifyAdmin } from '../utils/token_verify'

const bannedUserRouter = express.Router()

bannedUserRouter.post('/register', (req, res) => {
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

	verifyAdmin(req.cookies.auth_token)
		.then((admin) => {
			if (admin) {
				banUser()
			} else {
				res.status(500)
				res.send('User is not an admin')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to check if user was an admin')
		})

	/* try {
		const body: any = await req.json()
		// const inputUserId: number = Number(body.userId)
		const isAdmin: boolean = await verifyAdmin(req)

		if (isAdmin) { // is admin
			await Course?.create({
				userId: body.userId,
				unbanDate: body.unbanDate
			})
			return new Response('Successfully created banned user with ID: ' + body.userId)
		} else {
			throw new Error('User is not an admin')
		}
	} catch (e) {
		console.error(e)
		return new Response('Failed to ban user')
	} */
})

export default bannedUserRouter
