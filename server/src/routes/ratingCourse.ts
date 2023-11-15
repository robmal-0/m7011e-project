import express from 'express'
import RatingCourse from '../models/RatingCourse'
import { verifyLogin } from '../utils/token_verify'

const ratingCourseRouter = express.Router()

ratingCourseRouter.post('/register/:courseId', (req, res) => {
	function createCourseRating (auth: boolean, match: boolean): void { // local function to create a course rating
		if (auth) { // can authenticate
			if (match) { // user id matches authentication id
				RatingCourse?.findOrCreate({
					where: {
						userId: inputUserId,
						courseId: req.params.courseId,
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
						res.send('Failed to rate course')
					})
			} else {
				res.status(500)
				res.send('Trying to rate class for other user.')
			}
		} else {
			res.status(500)
			res.send('User is of type undefined')
		}
	}

	const inputUserId: number = Number(req.body.userId)
	verifyLogin(req.cookies.auth_token, inputUserId)
		.then(([auth, match]) => {
			createCourseRating(auth, match)
		})
		.catch((e) => {
			console.log(e)
		})
})

export default ratingCourseRouter
