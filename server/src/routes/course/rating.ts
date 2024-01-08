import express from 'express'
import RatingCourse from '../../models/RatingCourse'
import jwt from 'jsonwebtoken'
import Course from '../../models/Course'
import { University, User } from '../../models'
import { type Model } from 'sequelize'

const ratingRouter = express.Router()

// find rating function
function findRating (whereClause: any, code: any, slug: any): Model<any, any> | null | any {
	console.log(whereClause, code, slug)
	return RatingCourse.findOne({
		include: [{
			model: Course,
			where: {
				code
			},
			attributes: ['id'],
			include: [{
				model: University,
				where: {
					slug
				}
			}]
		}, {
			model: User,
			where: whereClause,
			attributes: ['id']
		}]
	})
}

ratingRouter.post('/:uniSlug/course/:courseCode/rating', (req, res) => {
	// check that user is logged in
	const userId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	University.findOne({
		where: {
			slug: req.params.uniSlug
		},
		include: [{
			model: Course,
			where: {
				code: req.params.courseCode
			},
			attributes: ['id']
		}],
		attributes: ['id']
	})
		.then((result) => {
			RatingCourse?.findOrCreate({
				where: {
					userId,
					courseId: result?.dataValues.Courses[0].dataValues.id,
					stars: req.body.stars
				}
			})
				.then(([user, created]) => {
					if (created) {
						res.status(201)
						res.send('Successfully rated course')
					} else {
						res.status(200)
						res.send('Course was already rated ' + req.body.stars + ' stars')
					}
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to find or create rating for course')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about course')
		})
})

ratingRouter.patch('/:uniSlug/course/:courseCode/rating', (req, res) => {
	// check if user is admin or user that created rating

	const userId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	const username = req.query.user !== undefined ? String(req.query.user) : undefined

	let whereClause

	// if username is set use that, otherwise use userId
	if (username !== undefined) {
		whereClause = {
			username
		}
	} else {
		whereClause = {
			id: userId
		}
	}

	findRating(whereClause, req.params.courseCode, req.params.uniSlug)
		.then((result: Model<any, any> | null) => {
			RatingCourse.update(req.body, {
				where: {
					userId: result?.dataValues.User.id,
					courseId: result?.dataValues.Course.id
				}
			})
				.then((saved) => {
					if (saved[0] === 1) {
						res.status(200)
						res.send('Rating was updated')
					} else {
						res.status(404)
						res.send('Could not find courseId or userId')
					}
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to update rating')
				})
		})
		.catch((e: any) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about rating')
		})
})

ratingRouter.delete('/:uniSlug/course/:courseCode/rating', (req, res) => {
	// check if user is admin or user that created rating

	const userId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	const username = req.query.user !== undefined ? String(req.query.user) : undefined

	let whereClause

	// if username is set use that, otherwise use userId
	if (username !== undefined) {
		whereClause = {
			username
		}
	} else {
		whereClause = {
			id: userId
		}
	}

	findRating(whereClause, req.params.courseCode, req.params.uniSlug)
		.then((result: Model<any, any> | null) => {
			console.log(result?.dataValues)
			RatingCourse.destroy({
				where: {
					userId: result?.dataValues.User.id,
					courseId: result?.dataValues.Course.id
				}
			})
				.then((result) => {
					if (result === 1) {
						res.status(200)
						res.send('Rating was removed')
					} else {
						res.status(404)
						res.send('Could not find courseId or userId')
					}
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to remove rating')
				})
		})
		.catch((e: any) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about rating')
		})
})

ratingRouter.get('/:uniSlug/course/:courseCode/rating', (req, res) => {
	const username = req.query.user !== undefined ? String(req.query.user) : undefined

	let whereClause

	// if username is set use that, otherwise get all users
	if (username !== undefined) {
		whereClause = {
			username
		}
	} else {
		whereClause = {}
	}

	RatingCourse.findAll({
		include: [{
			model: Course,
			where: {
				code: req.params.courseCode
			},
			attributes: ['name', 'code'],
			include: [{
				model: University,
				where: {
					slug: req.params.uniSlug
				},
				attributes: ['name']
			}]
		}, {
			model: User,
			where: whereClause,
			attributes: ['username']
		}],
		attributes: ['stars']
	})
		.then((result) => {
			console.log(result.length)
			if (result !== undefined && result.length !== 0) {
				res.status(200)
				res.send(result)
			} else {
				res.status(404)
				res.send('Rating(s) could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about rating')
		})
})

export default ratingRouter
