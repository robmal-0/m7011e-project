import express from 'express'
import Course from '../models/Course'
import CourseParticipation from '../models/CourseParticipation'
import RatingCourse from '../models/RatingCourse'
import DiscussionCourse from '../models/DiscussionCourse'
import DiscussionComment from '../models/DiscussionComment'
import jwt from 'jsonwebtoken'
import { verifyLogin } from '../utils/token_verify'

const courseRouter = express.Router()

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

// ----- /course/ -----

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

courseRouter.patch('/:courseId', (req, res) => {
	// add check if user is admin or a moderator for course

	Course.update(req.body, {
		where: {
			id: req.params.courseId
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

courseRouter.post('/', (req, res) => {
	// add confirmation that user is logged in and an admin

	Course?.findOrCreate({
		where: {
			name: req.body.name,
			code: req.body.code,
			uniId: req.body.uniId
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

courseRouter.delete('/:courseId', (req, res) => {
	// Add check that user is admin or a moderator over course

	Course.destroy({
		where: {
			id: req.params.courseId
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

// ------------------------------------------------------------
// ----- /course/participation/ -----

courseRouter.post('/:courseId/participation', (req, res) => {
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

courseRouter.patch('/:courseId/participation/:userId', (req, res) => {
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

courseRouter.delete('/:courseId/participation', (req, res) => {
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

courseRouter.get('/:courseId/participation/', (req, res) => {
	// const courseId = req.query.course !== undefined ? String(req.query.course) : null
	const courseId = req.params.courseId
	const userId = req.query.user !== undefined ? String(req.query.user) : null

	let whereClause

	if (courseId !== null && userId !== null) {
		whereClause = {
			courseId,
			userId
		}
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

// ------------------------------------------------------------
// ----- /course/rating/ -----

courseRouter.post('/:courseId/rating', (req, res) => {
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

courseRouter.patch('/:courseId/rating/', (req, res) => {
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

courseRouter.delete('/:courseId/rating', (req, res) => {
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

courseRouter.get('/:courseId/rating/', (req, res) => {
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

// ------------------------------------------------------------
// ----- /course/discussion/ -----

courseRouter.get('/:courseId/discussion/:discussionId', (req, res) => {
	DiscussionCourse.findOne({
		where: {
			id: req.params.discussionId,
			courseId: req.params.courseId
		}
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find discussion about course')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about discussion')
		})
})

courseRouter.post('/:courseId/discussion', (req, res) => {
	// make sure user is logged in

	DiscussionCourse?.create({
		userId: req.body.userId,
		courseId: req.params.courseId,
		subject: req.body.subject,
		description: req.body.description
	})
		.then((created) => {
			res.status(200)
			res.send('Discussion has been created')
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to create discussion')
		})
})

courseRouter.delete('/:courseId/discussion/:discussionId', (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	DiscussionCourse.destroy({
		where: {
			id: req.params.discussionId,
			courseId: req.params.courseId
		}
	})
		.then((result) => {
			if (result === 1) {
				res.status(200)
				res.send('The discussion has been removed')
			} else {
				res.status(404)
				res.send('The discussion could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to remove the discussion')
		})
})

courseRouter.patch('/:courseId/discussion/:discussionId', (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	DiscussionCourse.update(req.body, {
		where: {
			id: req.params.discussionId,
			courseId: req.params.courseId
		}
	})
		.then((saved) => {
			if (saved[0] === 1) {
				res.status(200)
				res.send('Discussion information was updated')
			} else {
				res.status(404)
				res.send('Could not find discussion')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to update discussion information')
		})
})

// ------------------------------------------------------------
// ----- /course/discussion/comment -----

courseRouter.post('/:courseId/discussion/:discussionId/comment', (req, res) => {
	// check user is logged in

	const responseTo = req.body.responseTo !== undefined ? req.body.responseTo : null

	DiscussionComment?.create({
		discussionCourseId: req.params.discussionId,
		userId: req.body.userId,
		commentText: req.body.commentText,
		responseTo
	})
		.then((created) => {
			res.status(200)
			res.send('Comment has been created')
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to create comment')
		})
})

// get one comment
courseRouter.get('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
	DiscussionComment.findOne({
		where: {
			id: req.params.commentId,
			discussionCourseId: req.params.discussionId
		}
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find comment')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get information about comment')
		})
})

// get all comments
courseRouter.get('/:courseId/discussion/:discussionId/comment', (req, res) => {
	DiscussionComment.findAll({
		where: {
			discussionCourseId: req.params.discussionId
		}
	})
		.then((found) => {
			if (found !== null) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('Could not find comments for the discussion')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get all comments for discussion')
		})
})

courseRouter.delete('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	DiscussionComment.destroy({
		where: {
			id: req.params.commentId,
			discussionCourseId: req.params.discussionId
		}
	})
		.then((result) => {
			if (result === 1) {
				res.status(200)
				res.send('The comment has been removed')
			} else {
				res.status(404)
				res.send('The comment could not be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to remove the comment')
		})
})

courseRouter.patch('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	DiscussionComment.update({ commentText: req.body.commentText }, {
		where: {
			id: req.params.commentId,
			discussionCourseId: req.params.discussionId
		}
	})
		.then((saved) => {
			if (saved[0] === 1) {
				res.status(200)
				res.send('Comment information was updated')
			} else {
				res.status(404)
				res.send('Could not find comment')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to update comment information')
		})
})

export default courseRouter
