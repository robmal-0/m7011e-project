import express from 'express'
import BannedUser from '../../models/BannedUser'
import { verifyAdmin } from '../../utils/token_verify'

const banRouter = express.Router()

// get info about one specific banned user
banRouter.get('/:uId/banned/', (req, res) => {
	// add check user is admin

	BannedUser.findAll({
		where: {
			userId: req.params.uId
		}
	})
		.then((found) => {
			if (found[0] !== undefined) {
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

// get list of all banned users
banRouter.get('/banned/', (req, res) => {
	// add check user is admin

	BannedUser.findAll({
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('No users are banned')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about banned users')
		})
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
banRouter.post('/:uId/banned/', async (req, res) => {
	function banUser (): void {
		BannedUser?.findOrCreate({
			where: {
				userId: req.params.uId,
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
banRouter.delete('/:uId/banned/', async (req, res) => {
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
banRouter.patch('/:uId/banned/', async (req, res) => {
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

export default banRouter
