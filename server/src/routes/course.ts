import express from 'express'
import Course from '../models/Course'
import { requireAdmin, requireLogin } from '../utils/auth_utils'
import { University } from '../models'

const courseRouter = express.Router()

// ----- /course/ -----

// Used to get information about one course at a university
courseRouter.get('/:uniSlug/course/:courseCode', requireLogin(), (req, res) => {
	// maybe add check for logged in?

	Course.findOne({
		where: {
			code: req.params.courseCode
		},
		attributes: {
			exclude: ['uniId']
		},
		include: {
			model: University,
			where: {
				slug: req.params.uniSlug
			},
			attributes: {
				exclude: ['slug']
			}
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
courseRouter.get('/:uniSlug/course', requireLogin(), (req, res) => {
	Course.findAll({
		attributes: {
			exclude: ['uniId']
		},
		include: {
			model: University,
			where: {
				slug: req.params.uniSlug
			},
			attributes: {
				exclude: ['slug']
			}
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

courseRouter.patch('/:uniSlug/course/:courseCode', requireAdmin(), (req, res) => {
	// add check if user is admin, done
	// add check if user is moderator for course

	University.findOne({
		where: {
			slug: req.params.uniSlug
		}
	})
		.then((result) => {
			if (result !== null) {
				Course.update(req.body, {
					where: {
						uniId: result?.dataValues.id,
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
			} else {
				res.status(404)
				res.send('University could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get university')
		})
})

courseRouter.post('/:uniSlug/course', requireAdmin(), (req, res) => {
	// add check that user is an admin, done

	University.findOne({
		where: {
			slug: req.params.uniSlug
		}
	})
		.then((result) => {
			if (result !== null) {
				Course?.findOrCreate({
					where: {
						name: req.body.name,
						code: req.body.code,
						uniId: result.dataValues.id
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
			} else {
				res.status(404)
				res.send('University could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get university')
		})
})

courseRouter.delete('/:uniSlug/course/:courseCode', requireAdmin(), (req, res) => {
	// Add check that user is admin, done

	University.findOne({
		where: {
			slug: req.params.uniSlug
		}
	})
		.then((result) => {
			if (result !== null) {
				Course.destroy({
					where: {
						uniId: result.dataValues.id,
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
			} else {
				res.status(404)
				res.send('University could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get university')
		})
})

export default courseRouter
