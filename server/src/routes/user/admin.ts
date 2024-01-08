import express from 'express'
import { Admin, User, type AdminType } from '../../models'
import { requireAdmin } from '../../utils/auth_utils'

const adminRouter = express.Router()

// get info about one specific admin user
adminRouter.get('/:username/admin/', requireAdmin(), (req, res) => {
	// add check user is admin

	Admin.findOne({
		include: {
			model: User,
			where: {
				username: req.params.username
			},
			attributes: {
				exclude: ['password', 'userType']
			}
		}
	})
		.then((found: any) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find admin user')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about admin user')
		})
})

// get info about all admin users
adminRouter.get('/admin/', requireAdmin(), (req, res) => {
	// add check user is admin

	Admin.findAll({
		include: {
			model: User,
			attributes: {
				exclude: ['password', 'userType']
			}
		}
	})
		.then((found: any) => {
			const results: AdminType = found
			if (results !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find admin users')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about admin users')
		})
})

adminRouter.post('/:username/admin/', requireAdmin(), (req, res) => {
	// add check user is admin

	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result) => {
			if (result !== null) {
				Admin.findOrCreate({
					where: {
						userId: result.dataValues.id
					}
				})
					.then(([user, created]) => {
						if (created) {
							res.status(201)
							res.send('User has been promoted to admin status')
						} else {
							res.status(200)
							res.send('User was already of admin status')
						}
					})
					.catch((e) => {
						console.error(e)
						res.status(500)
						res.send('Failed to get create admin user')
					})
			} else {
				res.status(404)
				res.send('User could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user')
		})
})

adminRouter.delete('/:username/admin/', requireAdmin(), (req, res) => {
	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result) => {
			if (result !== null) {
				Admin.destroy({
					where: {
						userId: result?.dataValues.id
					}
				})
					.then((result) => {
						if (result === 1) {
							res.status(200)
							res.send('User is no longer an admin')
						} else {
							res.status(404)
							res.send('User could not be found')
						}
					})
					.catch((e) => {
						console.error(e)
						res.status(500)
						res.send('Failed to remove users admin privileges')
					})
			} else {
				res.status(404)
				res.send('User could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user')
		})
})

export default adminRouter
