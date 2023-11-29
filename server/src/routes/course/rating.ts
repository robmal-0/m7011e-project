import express from 'express'
import RatingCourse from '../../models/RatingCourse'
import jwt from 'jsonwebtoken'
import { verifyLogin } from '../../utils/token_verify'

const ratingRouter = express.Router()

// login functions
function loginStatus (auth: boolean, match: boolean): [boolean, string] {
	// add something for admin users being able to remove other users ratings?

	if (auth) { // can authenticate
		if (match) { // user id matches authentication id
			return [true, 'User has been authenticated']
		} else {
			return [false, 'User is using other users id']
		}
	} else {
		return [false, 'User is of type undefined']
	}
}

function login (req: any, res: any, func: () => any): void {
	const inputUserId: number = req.body.userId

	if (req.body.userId !== undefined) { // if user is trying to do something for a specific user
		verifyLogin(req.cookies.auth_token, inputUserId)
			.then(([auth, match]) => {
				const [loggedIn, message] = loginStatus(auth, match)
				if (loggedIn) {
					func()
				} else {
					res.status(500)
					res.send(message)
				}
			})
			.catch((e) => {
				console.log(e)
			})
	} else { // if they are trying to change something for themselves
		func()
	}
}

ratingRouter.post('/:courseId/rating', (req, res) => {
	function createCourseRating (): void { // local function to create a course rating
		const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
		const userId = req.body.userId !== undefined ? req.body.userId : claims.id // Check if userId has been sent as JSON

		RatingCourse?.findOrCreate({
			where: {
				userId,
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
	}

	login(req, res, createCourseRating)
})

ratingRouter.patch('/:courseId/rating/', (req, res) => {
	function patchCourseRating (): void {
		const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
		const userId = req.body.userId !== undefined ? req.body.userId : claims.id // Check if userId has been sent as JSON

		RatingCourse?.update({ stars: req.body.stars }, {
			where: {
				userId,
				courseId: req.params.courseId
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
				res.send('Failed to update participation in course')
			})
	}

	login(req, res, patchCourseRating)
})

ratingRouter.delete('/:courseId/rating', (req, res) => {
	function removeCourseRating (): void {
		const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
		const userId = req.body.userId !== undefined ? req.body.userId : claims.id // Check if userId has been sent as JSON

		RatingCourse.destroy({
			where: {
				userId,
				courseId: req.params.courseId
			}
		})
			.then((result) => {
				if (result === 1) {
					res.status(200)
					res.send('Successfully removed rating')
				} else {
					res.status(404)
					res.send('Could not find rating to remove')
				}
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to remove rating')
			})
	}

	login(req, res, removeCourseRating)
})

ratingRouter.get('/:courseId/rating/', (req, res) => {
	function getCourseRating (): void {
		const claims = jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims
		const userId = req.query.userId ?? claims.id // Check if userId has been sent as query

		RatingCourse.findAll({
			where: {
				userId,
				courseId: req.params.courseId
			}
		})
			.then((found) => {
				if (found !== null) {
					res.status(200)
					res.send(found)
				} else {
					res.status(404)
					res.send('Could not find any rating for the given parameters')
				}
			})
			.catch((e) => {
				console.error(e)
				res.status(500)
				res.send('Failed to get information about rating')
			})
	}

	login(req, res, getCourseRating)
})

export default ratingRouter
