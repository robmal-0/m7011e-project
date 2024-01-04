import express from 'express'
import BannedUser from '../../models/BannedUser'
import { requireAdmin } from '../../utils/auth_utils'

const banRouter = express.Router()

// get info about one specific banned user
banRouter.get('/:uId/banned/', requireAdmin(), (req, res) => {
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
banRouter.get('/banned/', requireAdmin(), (req, res) => {
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
banRouter.post('/:uId/banned/', requireAdmin(), async (req, res) => {
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
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
banRouter.delete('/:uId/banned/', requireAdmin(), async (req, res) => {
	// check if user is logged in
	// check if user is an admin

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
})

// eslint-disable-next-line @typescript-eslint/no-misused-promises
banRouter.patch('/:uId/banned/', requireAdmin(), async (req, res) => {
	// check if user is logged in
	// check if user is an admin

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
})

export default banRouter
