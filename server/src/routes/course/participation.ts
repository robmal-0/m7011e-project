import express from 'express'
import CourseParticipation from '../../models/CourseParticipation'
import jwt from 'jsonwebtoken'
import { requireLogin } from '../../utils/auth_utils'
import Course from '../../models/Course'
import User from '../../models/User'

const participationRouter = express.Router()

participationRouter.post('/:uniId/course/:courseCode/participation', requireLogin(), (req, res) => {
	// add confirmation that user is logged in, done

	const uId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		}
	})
		.then((found) => {
			CourseParticipation?.findOrCreate({
				where: {
					courseId: found?.dataValues.id,
					userId: uId,
					courseStart: req.body.courseStart,
					courseEnd: req.body.courseEnd
				}
			})
				.then(([user, created]) => {
					if (created) {
						res.status(201)
						res.send('User was registered for course')
					} else {
						res.status(200)
						res.send('User was already registered for course')
					}
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to register for course')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about course')
		})
})

participationRouter.patch('/:uniId/course/:courseCode/participation/:username', (req, res) => {
	// check if user is admin, moderator for course, or the user themselves

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		},
		attributes: ['id']
	})
		.then((found1) => {
			User.findOne({
				where: {
					username: req.params.username
				},
				attributes: ['id']
			})
				.then((found2) => {
					CourseParticipation.update(req.body, {
						where: {
							courseId: found1?.dataValues.id,
							userId: found2?.dataValues.id
						}
					})
						.then((saved) => {
							if (saved[0] === 1) {
								res.status(200)
								res.send('Participation was updated')
							} else {
								res.status(404)
								res.send('Could not find courseId or userId')
							}
						})
						.catch((e) => {
							console.error(e)
							res.status(500)
							res.send('Failed to update participation in course')
						})
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to get information about user')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about course')
		})
})

participationRouter.delete('/:uniId/course/:courseCode/participation/:username', (req, res) => {
	// check if user is admin, moderator for course, or the user themselves

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		},
		attributes: ['id']
	})
		.then((found1) => {
			User.findOne({
				where: {
					username: req.params.username
				},
				attributes: ['id']
			})
				.then((found2) => {
					CourseParticipation.destroy({
						where: {
							courseId: found1?.dataValues.id,
							userId: found2?.dataValues.id
						}
					})
						.then((result) => {
							if (result === 1) {
								res.status(200)
								res.send('User was removed from course')
							} else {
								res.status(404)
								res.send('User could not be found')
							}
						})
						.catch((e) => {
							console.error(e)
							res.status(500)
							res.send('Failed to remove user from course')
						})
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to get information about user')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about course')
		})
})

participationRouter.get('/:uniId/course/:courseCode/participation/', (req, res) => {
	const username = req.query.user !== undefined ? String(req.query.user) : undefined
	console.log(username)

	let whereClause

	if (username !== undefined) {
		whereClause = {
			username
		}
	} else {
		whereClause = {}
	}

	CourseParticipation.findAll({
		include: [{
			model: Course,
			where: {
				uniId: req.params.uniId,
				code: req.params.courseCode
			}
		}, {
			model: User,
			where: whereClause
		}]
	})
		.then((result) => {
			if (result !== undefined) {
				res.status(200)
				res.send(result)
			} else {
				res.status(404)
				res.send('User(s) could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about course')
		})
})

export default participationRouter
