import express from 'express'
import CourseParticipation from '../models/CourseParticipation'

const courseParticipationRouter = express.Router()

courseParticipationRouter.post('/register/:courseId', (req, res) => {
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

export default courseParticipationRouter
