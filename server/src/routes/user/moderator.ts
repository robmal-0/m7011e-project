import express from 'express'
import Moderator, { type ModeratorType } from '../../models/Moderator'
import User from '../../models/User'

const modRouter = express.Router()

modRouter.post('/:uId/moderator', (req, res) => {
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

modRouter.delete('/:uId/Moderator', (req, res) => {
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

modRouter.get('/:uId/Moderator', (req, res) => {
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

export default modRouter
