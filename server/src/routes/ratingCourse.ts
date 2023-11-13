import server from '../init'
import CourseParticipation from '../models/RatingCourse'
import token_verify from '../utils/token_verify'

const ratingCourseRouter = server.addGroup('ratingCourse')

ratingCourseRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const user = await token_verify(req)
		const body: any = await req.json()
		const inputUserId: number = Number(body.userId)

		if (typeof user !== 'undefined') { // can authenticate
			if (user?.id === inputUserId) { // user id matches authentication id
				await CourseParticipation?.create({
					userId: body.userId,
					courseId: body.courseId,
					stars: body.stars
				})
				return new Response('Successfully registered rated the course')
			} else {
				throw new Error('Trying to rate class for other user. ' + user?.id + ' != ' + body.userId + ', ' + typeof user?.id + ' != ' + typeof inputUserId)
			}
		} else {
			throw new Error('User is of type undefined')
		}
	} catch (e) {
		console.error(e)
		return new Response('Failed to rate the course')
	}
})
