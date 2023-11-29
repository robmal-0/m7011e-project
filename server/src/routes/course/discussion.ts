import express from 'express'
import DiscussionCourse from '../../models/DiscussionCourse'
import DiscussionComment from '../../models/DiscussionComment'

const discussionRouter = express.Router()

// ------------------------------------------------------------
// ----- /course/discussion/ -----

discussionRouter.get('/:courseId/discussion/:discussionId', (req, res) => {
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

discussionRouter.post('/:courseId/discussion', (req, res) => {
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

discussionRouter.delete('/:courseId/discussion/:discussionId', (req, res) => {
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

discussionRouter.patch('/:courseId/discussion/:discussionId', (req, res) => {
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

discussionRouter.post('/:courseId/discussion/:discussionId/comment', (req, res) => {
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

discussionRouter.delete('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
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

discussionRouter.patch('/:courseId/discussion/:discussionId/comment/:commentId', (req, res) => {
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
