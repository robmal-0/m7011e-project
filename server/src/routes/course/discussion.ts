import express from 'express'
import slugify from 'slugify'
import Course from '../../models/Course'
import DiscussionCourse from '../../models/DiscussionCourse'
import DiscussionComment from '../../models/DiscussionComment'
import { requireAdmin, requireModerator } from '../../utils/auth_utils'

const discussionRouter = express.Router()

// ------------------------------------------------------------
// ----- university/course/discussion/ -----

discussionRouter.get('/:uniId/course/:courseCode/discussion/:subject', (req, res) => {
	DiscussionCourse.findOne({
		attributes: ['subject', 'description'],
		where: {
			slug: req.params.subject
		},
		include: [
			{
				model: Course,
				attributes: ['uniId', 'code'],
				where: {
					uniId: req.params.uniId,
					code: req.params.courseCode
				},
				required: true
			}
		]
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

discussionRouter.post('/:uniId/course/:courseCode/discussion', (req, res) => {
	// make sure user is logged in

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		}
	})
		.then((result: any) => {
			DiscussionCourse?.create({
				courseId: result.id,
				userId: req.body.userId,
				subject: req.body.subject,
				slug: slugify(req.body.subject),
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
		.catch((error) => {
			console.error(error)
			res.status(500)
			res.send('Failed to find course at university')
		})
})

discussionRouter.delete('/:uniId/course/:courseCode/discussion/:subject', requireModerator('courseCode'), (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		},
		attributes: ['id']
	})
		.then((result) => {
			DiscussionCourse.destroy({
				where: {
					slug: req.params.subject,
					courseId: result?.dataValues.id
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
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get the ID of course')
		})
})

discussionRouter.patch('/:uniId/course/:courseCode/discussion/:subject', requireAdmin(), (req, res) => {
	// add check user is admin
	// add check user is moderator over course
	// add check user created discussion

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		},
		attributes: ['id']
	})
		.then((result) => {
			console.log('id: ' + result?.dataValues.id, 'subject: ' + req.params.subject)
			DiscussionCourse.update(req.body, {
				where: {
					id: result?.dataValues.id,
					slug: req.params.subject
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
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get the ID of course')
		})
})

// ------------------------------------------------------------
// ----- /course/discussion/comment -----

discussionRouter.post('/:uniId/course/:courseCode/discussion/:subject/comment', (req, res) => {
	// check user is logged in

	const responseTo = req.body.responseTo !== undefined ? req.body.responseTo : null

	Course.findOne({
		where: {
			uniId: req.params.uniId,
			code: req.params.courseCode
		},
		attributes: ['id']
	})
		.then((result) => {
			DiscussionCourse.update(req.body, {
				where: {
					id: result?.dataValues.id,
					slug: req.params.subject
				}
			})
			
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get the ID of course')
		})

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
discussionRouter.get('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
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
discussionRouter.get('/:courseId/discussion/:discussionId/comment', (req, res) => {
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

discussionRouter.delete('/:courseId/discussion/:discussionId/comment/:commentId', requireAdmin(), (req, res) => {
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

discussionRouter.patch('/:courseId/discussion/:discussionId/comment/:commentId', requireAdmin(), (req, res) => {
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

export default discussionRouter
