import express from 'express'
import Course from '../models/Course'
import { requireAdmin, requireLogin } from '../utils/auth_utils'

const courseRouter = express.Router()

// ----- /course/ -----

// Used to get information about one course at a university
courseRouter.get('/:uniId/course/:courseCode', requireLogin(), (req, res) => {
	// maybe add check for logged in?

	Course.findOne({
		where: {
			code: req.params.courseCode,
			uniId: req.params.uniId
		}
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

// Used to get information about all courses at university
courseRouter.get('/:uniId/course', requireLogin(), (req, res) => {
	Course.findAll({
		where: {
			uniId: req.params.uniId
		}
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

courseRouter.patch('/:uniId/course/:courseCode', requireAdmin(), (req, res) => {
	// add check if user is admin or a moderator for course

	Course.update(req.body, {
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		}
	})
		.then((saved) => {
			if (saved[0] === 1) {
				res.status(200)
				res.send('Course information was updated')
			} else {
				res.status(404)
				res.send('Course could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to update information about course')
		})
})

courseRouter.post('/:uniId/course', requireAdmin(), (req, res) => {
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

courseRouter.delete('/:uniId/course/:courseCode', requireAdmin(), (req, res) => {
	// Add check that user is admin or a moderator over course

	Course.destroy({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		}
	})
		.then((result) => {
			if (result === 1) {
				res.status(200)
				res.send('Course has been removed')
			} else {
				res.status(404)
				res.send('Course could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to remove course')
		})
})

export default courseRouter
