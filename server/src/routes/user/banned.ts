import express from 'express'
import { BannedUser, User } from '../../models'
import { requireAdmin } from '../../utils/auth_utils'

const banRouter = express.Router()

// get info about one specific banned user
banRouter.get('/:username/banned/', requireAdmin(), (req, res) => {
	// add check user is admin

	BannedUser.findOne({
		include: {
			model: User,
			where: {
				username: req.params.username
			},
			attributes: {
				exclude: ['password', 'userType']
			}
		},
		attributes: {
			exclude: ['userId']
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

// get list of all banned users
banRouter.get('/banned/', requireAdmin(), (req, res) => {
	// add check user is admin, done

	BannedUser.findAll({
		include: {
			model: User,
			attributes: {
				exclude: ['password', 'userType']
			}
		},
		attributes: {
			exclude: ['userId']
		}
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

banRouter.post('/:username/banned/', requireAdmin(), (req, res) => {
	// check that user is admin, done
	console.log('IS ADMIN!')

	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result) => {
			BannedUser?.findOrCreate({
				where: {
					userId: result?.dataValues.id,
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
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about user')
		})
})

banRouter.delete('/:username/banned/', requireAdmin(), (req, res) => {
	// check if user is an admin, done

	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result) => {
			if (result !== null) {
				BannedUser.destroy({
					where: { userId: result?.dataValues.id }
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
			} else {
				res.status(404)
				res.send('User could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about user')
		})
})

banRouter.patch('/:username/banned/', requireAdmin(), (req, res) => {
	// check if user is an admin, done

	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result) => {
			if (result !== null) {
				BannedUser.update(req.body, {
					where: { userId: result?.dataValues.id }
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
			} else {
				res.status(404)
				res.send('User information could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about user')
		})
})

export default banRouter
