import express from 'express'
import slugify from 'slugify'
import jwt from 'jsonwebtoken'
import { getUser, requireLogin } from '../../utils/auth_utils'
import { University, User, DiscussionComment, DiscussionCourse, Course } from '../../models'
import { Op } from 'sequelize'
import { Privileges } from '../../utils/get_user'

const discussionRouter = express.Router()

// ------------------------------------------------------------
// ----- university/course/discussion/ -----

// get one discussion
discussionRouter.get('/:uniSlug/course/:courseCode/discussion/:subject', (req, res) => {
	DiscussionCourse.findOne({
		attributes: ['subject', 'description'],
		where: {
			slug: req.params.subject
		},
		include: [{
			model: Course,
			attributes: ['code'],
			where: {
				code: req.params.courseCode
			},
			required: true,
			include: [{
				model: University,
				where: {
					slug: req.params.uniSlug
				},
				attributes: ['name', 'country', 'city']
			}]
		}]
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

// get all discussions
discussionRouter.get('/:uniSlug/course/:courseCode/discussion/', (req, res) => {
	DiscussionCourse.findAll({
		attributes: ['subject', 'description', 'slug'],
		include: [{
			model: Course,
			attributes: ['code'],
			where: {
				code: req.params.courseCode
			},
			required: true,
			include: [{
				model: University,
				where: {
					slug: req.params.uniSlug
				},
				attributes: ['name', 'country', 'city']
			}]
		}]
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

// get all discussions
discussionRouter.get('/:uniSlug/course/:courseCode/discussion/', (req, res) => {
	DiscussionCourse.findAll({
		attributes: ['subject', 'description', 'slug'],
		include: [{
			model: Course,
			attributes: ['code'],
			where: {
				code: req.params.courseCode
			},
			required: true,
			include: [{
				model: University,
				where: {
					slug: req.params.uniSlug
				},
				attributes: ['name', 'country', 'city']
			}]
		}]
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

discussionRouter.post('/:uniSlug/course/:courseCode/discussion', requireLogin(), (req, res) => {
	// make sure user is logged in

	const uId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	Course.findOne({
		where: {
			code: req.params.courseCode
		},
		include: [{
			model: University,
			where: {
				slug: req.params.uniSlug
			}
		}],
		attributes: ['id']
	})
		.then((result: any) => {
			DiscussionCourse?.findOrCreate({
				where: {
					courseId: result.dataValues.id,
					userId: uId,
					subject: req.body.subject,
					slug: slugify(req.body.subject),
					description: req.body.description
				}
			})
				.then(([user, created]) => {
					if (created) {
						res.status(201)
						res.send('Discussion has been created')
					} else {
						res.status(200)
						res.send('Discussion already exists')
					}
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

discussionRouter.delete('/:uniSlug/course/:courseCode/discussion/:subject', requireLogin(), (req, res) => {
	// add check user is admin, done
	// add check user created discussion, done

	Course.findOne({
		where: {
			code: req.params.courseCode
		},
		include: [{
			model: University,
			where: {
				slug: req.params.uniSlug
			}
		}],
		attributes: ['id']
	})
		.then((result) => {
			const user = getUser(res)
			const cond: any[] = [
				{
					slug: req.params.subject,
					courseId: result?.dataValues.id,
					userId: user.user.id
				}
			]

			if (user.privileges >= Privileges.ADMIN) {
				cond.push({
					slug: req.params.subject,
					courseId: result?.dataValues.id
				})
			}

			DiscussionCourse.destroy({
				where: {
					[Op.or]: cond
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

discussionRouter.patch('/:uniSlug/course/:courseCode/discussion/:subject', requireLogin(), (req, res) => {
	// add check user is admin, done
	// add check user created discussion

	Course.findOne({
		where: {
			code: req.params.courseCode
		},
		include: [{
			model: University,
			where: {
				slug: req.params.uniSlug
			}
		}],
		attributes: ['id']
	})
		.then((result) => {
			const user = getUser(res)
			const cond: any[] = [
				{
					slug: req.params.subject,
					courseId: result?.dataValues.id,
					userId: user.user.id
				}
			]

			if (user.privileges >= Privileges.ADMIN) {
				cond.push({
					slug: req.params.subject,
					courseId: result?.dataValues.id
				})
			}

			DiscussionCourse.update(req.body, {
				where: {
					[Op.or]: cond
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

discussionRouter.post('/:uniSlug/course/:courseCode/discussion/:subject/comment', requireLogin(), (req, res) => {
	// check user is logged in, done

	// console.log('uniSlug:', req.params.uniSlug, 'code:', req.params.courseCode, 'subject:', req.params.subject)

	const responseTo = req.body.responseTo !== undefined ? req.body.responseTo : null

	const uId = (jwt.verify(req.cookies.auth_token, process.env.SECRET_KEY as string) as unknown as claims).id

	DiscussionCourse.findOne({
		where: {
			slug: req.params.subject
		},
		include: [{
			model: Course,
			where: {
				code: req.params.courseCode
			},
			include: [{
				model: University,
				where: {
					slug: req.params.uniSlug
				}
			}]
		}],
		attributes: ['id']
	})
		.then((result1) => {
			DiscussionComment.findOne({
				where: {
					discussionCourseId: result1?.dataValues.id
				},
				order: [
					['localId', 'DESC']
				],
				attributes: ['localId']
			})
				.then((result2) => {
					const numOfComments = result2?.dataValues.localId !== undefined ? result2?.dataValues.localId + 1 : 0
					DiscussionComment.findOne({
						where: {
							localId: responseTo,
							discussionCourseId: result1?.dataValues.id
						}
					})
						.then((result3) => {
							DiscussionComment?.create({
								localId: numOfComments,
								discussionCourseId: result1?.dataValues.id,
								userId: uId,
								commentText: req.body.commentText,
								responseTo: result3?.dataValues.id
							})
								.then((created) => {
									res.status(201)
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
discussionRouter.get('/:uniSlug/course/:courseCode/discussion/:subject/comment/:localCommentId', (req, res) => {
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
					code: req.params.courseCode
				},
				attributes: ['name', 'code'],
				include: [{
					model: University,
					where: {
						slug: req.params.uniSlug
					},
					attributes: ['name', 'country', 'city']
				}]
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
discussionRouter.get('/:uniSlug/course/:courseCode/discussion/:subject/comment', (req, res) => {
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
					code: req.params.courseCode
				},
				attributes: ['name', 'code'],
				include: [{
					model: University,
					where: {
						slug: req.params.uniSlug
					},
					attributes: ['name', 'country', 'city']
				}]
			}]
		}],
		attributes: ['id', 'commentText', 'responseTo']
	})
		.then((found) => {
			if (found !== null && found.length !== 0) {
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

discussionRouter.delete('/:uniSlug/course/:courseCode/discussion/:subject/comment/:localCommentId', requireLogin(), (req, res) => {
	// add check user is admin, done
	// add check user created discussion, done

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
					code: req.params.courseCode
				},
				include: [{
					model: University,
					where: {
						slug: req.params.uniSlug
					},
					attributes: ['name', 'country', 'city']
				}]
			}]
		}],
		attributes: ['id']
	})
		.then((found) => {
			const user = getUser(res)
			const cond: any[] = [
				{
					id: found?.dataValues.id,
					userId: user.user.id
				}
			]

			if (user.privileges >= Privileges.ADMIN) {
				cond.push({
					id: found?.dataValues.id
				})
			}
			DiscussionComment?.destroy({
				where: {
					[Op.or]: cond
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
			res.send('Failed to get the comment from discussion')
		})
})

discussionRouter.patch('/:uniSlug/course/:courseCode/discussion/:subject/comment/:localCommentId', requireLogin(), (req, res) => {
	// add check user is admin, done
	// add check user created comment, done

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
					code: req.params.courseCode
				},
				include: [{
					model: University,
					where: {
						slug: req.params.uniSlug
					},
					attributes: ['name', 'country', 'city']
				}]
			}]
		}],
		attributes: ['id']
	})
		.then((found) => {
			const user = getUser(res)
			const cond: any[] = [
				{
					id: found?.dataValues.id,
					userId: user.user.id
				}
			]

			if (user.privileges >= Privileges.ADMIN) {
				cond.push({
					id: found?.dataValues.id
				})
			}
			DiscussionComment.update({ commentText: req.body.commentText }, {
				where: {
					[Op.or]: cond
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
