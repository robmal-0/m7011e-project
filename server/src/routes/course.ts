import express from 'express'
import Course from '../models/Course'

const courseRouter = express.Router()

// Used to get information about course
courseRouter.get('/:courseId', (req, res) => {
	// maybe add check for logged in?

	Course.findOne({
		where: { id: req.params.courseId }
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find requested record')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to find course')
		})
})

courseRouter.post('/:uniId', (req, res) => {
	// add confirmation that user is logged in and an admin

	Course?.findOrCreate({
		where: {
			name: req.body.name,
			code: req.body.code,
			uniId: req.params.uniId
		}
	})
		.then(([user, created]) => {
			if (created) {
				res.status(201)
				res.send('New course was created')
			} else {
				res.status(200)
				res.send('Course already existed')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to create course')
		})
})

export default courseRouter
