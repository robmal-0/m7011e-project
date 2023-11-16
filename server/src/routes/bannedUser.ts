import express from 'express'
import BannedUser from '../models/BannedUser'
import { verifyAdmin } from '../utils/token_verify'

const bannedUserRouter = express.Router()

bannedUserRouter.delete('/:uId', (req, res) => {
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

	verifyAdmin(req.cookies.auth_token)
		.then((admin) => {
			if (admin) {
				unbanUser()
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
})

bannedUserRouter.post('/', (req, res) => {
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
})

export default bannedUserRouter
