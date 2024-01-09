import express from 'express'
import Moderator from '../../models/Moderator'
import User from '../../models/User'
import { requireAdmin } from '../../utils/auth_utils'
import { Course, University } from '../../models'

const modRouter = express.Router()

modRouter.post('/moderator', requireAdmin(), (req, res) => {
	// add check user is admin, done
	// add check that user being promoted is not banned

	User.findOne({
		where: {
			username: req.body.user
		}
	})
		.then((result1) => {
			Course.findOne({
				where: {
					code: req.body.courseCode
				},
				include: [{
					model: University,
					where: {
						name: req.body.university
					}
				}]
			})
				.then((result2) => {
					Moderator.findOrCreate({
						where: {
							userId: result1?.dataValues.id,
							courseId: result2?.dataValues.id
						}
					})
						.then(([user, created]) => {
							if (created) {
								res.status(201)
								res.send('User has been promoted to moderator status')
							} else {
								res.status(200)
								res.send('User was already a moderator over course')
							}
						})
						.catch((e) => {
							console.error(e)
							res.status(500)
							res.send('Failed to make user a moderator')
						})
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to get course or university from database')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user from database')
		})
})

modRouter.delete('/:username/Moderator', requireAdmin(), (req, res) => {
	// add check user is admin, done

	const universityWhere = {
		where: {} as any,
		attributes: ['id']
	}
	const courseWhere = {
		where: {} as any,
		attributes: ['id'],
		include: [{
			model: University,
			universityWhere
		}]
	}

	if (req.query.university !== undefined && req.query.course !== undefined) {
		universityWhere.where.slug = req.query.university
		courseWhere.where.code = req.query.course
	}

	User.findOne({
		where: {
			username: req.params.username
		}
	})
		.then((result1) => {
			Course.findAll(courseWhere)
				.then((result2) => {
					const courses: any[] = []
					result2.forEach(function (element) {
						courses.push(element.dataValues.id)
					})
					Moderator.destroy({
						where: {
							userId: result1?.dataValues.id,
							courseId: courses
						}
					})
						.then((result) => {
							if (result !== 0) {
								res.status(200)
								res.send('User is no longer a moderator over course(s)')
							} else {
								res.status(404)
								res.send('User or courses could not be found among moderator')
							}
						})
						.catch((e) => {
							console.error(e)
							res.status(500)
							res.send('Failed to remove user from moderators')
						})
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to get course or university from database')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get user(s) from database')
		})
})

modRouter.get('/Moderator', (req, res) => {
	const modWhere = {
		include: [{
			model: Course,
			where: {} as any,
			attributes: ['id', 'name', 'code'],
			include: [{
				model: University,
				attributes: ['id', 'name', 'country', 'city'],
				where: {} as any
			}]
		}, {
			model: User,
			where: {} as any,
			attributes: ['id', 'username', 'email']
		}],
		attributes: ['createdAt', 'updatedAt']
	}

	if (req.query.university !== undefined) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		modWhere.include[0]!.include![0]!.where.slug = req.query.university
	}
	if (req.query.course !== undefined) {
		modWhere.include[0].where.code = req.query.course
	}
	if (req.query.user !== undefined) {
		modWhere.include[1].where.username = req.query.user
	}

	Moderator.findAll(modWhere)
		.then((found) => {
			if (found !== null && found.length !== 0) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('No records could be found for the given parameters')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to search for moderator')
		})
})

export default modRouter
