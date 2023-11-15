import express from 'express'
import Course from '../models/Course'

const courseRouter = express.Router()

courseRouter.post('/register/:uniId', (req, res) => {
	// add confirmation that user is logged in

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
