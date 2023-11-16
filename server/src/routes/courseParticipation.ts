import express from 'express'
import CourseParticipation from '../models/CourseParticipation'
import jwt from 'jsonwebtoken'

const courseParticipationRouter = express.Router()

courseParticipationRouter.post('/:courseId', (req, res) => {
	// add confirmation that user is logged in

	CourseParticipation?.findOrCreate({
		where: {
			courseId: req.params.courseId,
			userId: req.body.userId,
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

courseParticipationRouter.patch('/:courseId/:userId', (req, res) => {
	// add check: if trying to remove other user from course, check if admin

	CourseParticipation.update(req.body, {
		where: {
			courseId: req.params.courseId,
			userId: req.params.userId
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

courseParticipationRouter.delete('/:courseId', (req, res) => {
	// add check: if trying to remove other user from course, check if admin
	const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
	const userId = req.body.userId !== undefined ? req.body.userId : claims.id

	CourseParticipation.destroy({
		where: {
			courseId: req.params.courseId,
			userId
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

courseParticipationRouter.get('/', (req, res) => {
	const courseId = req.query.course !== undefined ? String(req.query.course) : null
	const userId = req.query.user !== undefined ? String(req.query.user) : null

	let whereClause

	if (courseId !== null && userId !== null) {
		whereClause = {
			courseId,
			userId
		}
	} else if (courseId == null) {
		whereClause = { userId }
	} else {
		whereClause = { courseId }
	}

	CourseParticipation.findAll({
		where: whereClause
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find any participation information for the given parameters')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about participation')
		})
})

export default courseParticipationRouter
