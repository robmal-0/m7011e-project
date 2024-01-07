import express from 'express'
import slugify from 'slugify'
import jwt from 'jsonwebtoken'
import Course from '../../models/Course'
import DiscussionCourse from '../../models/DiscussionCourse'
import DiscussionComment from '../../models/DiscussionComment'
import { requireAdmin, requireLogin } from '../../utils/auth_utils'
import User from '../../models/User'

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

discussionRouter.delete('/:uniId/course/:courseCode/discussion/:subject', requireAdmin(), (req, res) => {
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

discussionRouter.post('/:uniId/course/:courseCode/discussion/:subject/comment', requireLogin(), (req, res) => {
	// check user is logged in

	const responseTo = req.body.responseTo !== undefined ? req.body.responseTo : null

	const uId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	DiscussionCourse.findOne({
		where: {
			slug: req.params.subject
		},
		include: [{
			model: Course,
			where: {
				uniId: req.params.uniId,
				code: req.params.courseCode
			}
		}],
		attributes: ['id']
	})
		.then((result1) => {
			DiscussionComment.findAll({
				where: {
					discussionCourseId: result1?.dataValues.id
				},
				attributes: ['id']
			})
				.then((result2) => {
					console.log(result2[0])
					DiscussionComment.findOne({
						where: {
							localId: responseTo,
							discussionCourseId: result1?.dataValues.id
						}
					})
						.then((result3) => {
							DiscussionComment?.create({
								localId: result2.length,
								discussionCourseId: result1?.dataValues.id,
								userId: uId,
								commentText: req.body.commentText,
								responseTo: result3?.dataValues.id
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
						.catch((e) => {
							console.error(e)
							res.status(500)
							res.send('Failed to get the ID of discussion')
						})
				})
				.catch((e) => {
					console.error(e)
					res.status(500)
					res.send('Failed to get the ID of discussion')
				})
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get the ID of discussion')
		})
})

// get one comment
discussionRouter.get('/:uniId/course/:courseCode/discussion/:subject/comment/:localCommentId', (req, res) => {
	DiscussionComment.findOne({
		where: {
			localId: req.params.localCommentId
		},
		include: [{
			model: DiscussionCourse,
			where: {
				slug: req.params.subject
			},
			attributes: ['subject', 'description'],
			include: [{
				model: Course,
				where: {
					uniId: req.params.uniId,
					code: req.params.courseCode
				},
				attributes: ['name', 'code']
			}]
		}, {
			model: User,
			attributes: ['username']
		}],
		attributes: ['id', 'commentText', 'responseTo']
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

// get all comments
discussionRouter.get('/:uniId/course/:courseCode/discussion/:subject/comment', (req, res) => {
	DiscussionComment.findAll({
		include: [{
			model: DiscussionCourse,
			where: {
				slug: req.params.subject
			},
			attributes: ['subject', 'description'],
			include: [{
				model: Course,
				where: {
					uniId: req.params.uniId,
					code: req.params.courseCode
				},
				attributes: ['name', 'code']
			}]
		}],
		attributes: ['id', 'commentText', 'responseTo']
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

discussionRouter.delete('/:uniId/course/:courseCode/discussion/:subject/comment/:localCommentId', requireAdmin(), (req, res) => {
	// add check user is admin, done
	// add check user is moderator over course
	// add check user created discussion

	DiscussionComment.findOne({
		where: {
			localId: req.params.localCommentId
		},
		include: [{
			model: DiscussionCourse,
			where: {
				slug: req.params.subject
			},
			include: [{
				model: Course,
				where: {
					uniId: req.params.uniId,
					code: req.params.courseCode
				}
			}]
		}],
		attributes: ['id']
	})
		.then((found) => {
			DiscussionComment?.destroy({
				where: {
					id: found?.dataValues.id
				}
			})
				.then((found) => {
					if (found === 1) {
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
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get all comments for discussion')
		})
})

discussionRouter.patch('/:uniId/course/:courseCode/discussion/:subject/comment/:localCommentId', requireAdmin(), (req, res) => {
	// add check user is admin, done
	// add check user is moderator over course
	// add check user created discussion

	DiscussionComment.findOne({
		where: {
			localId: req.params.localCommentId
		},
		include: [{
			model: DiscussionCourse,
			where: {
				slug: req.params.subject
			},
			include: [{
				model: Course,
				where: {
					uniId: req.params.uniId,
					code: req.params.courseCode
				}
			}]
		}],
		attributes: ['id']
	})
		.then((found) => {
			DiscussionComment.update({ commentText: req.body.commentText }, {
				where: {
					id: found?.dataValues.id
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
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to get all comments for discussion')
		})
})

export default discussionRouter
