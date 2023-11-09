import server from '../init'
import CourseParticipation from '../models/RatingCourse'

const ratingCourseRouter = server.addGroup('ratingCourse')

ratingCourseRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		await CourseParticipation?.create({
			userId: body.userId,
			courseId: body.courseId,
			stars: body.stars
		})
		return new Response('Successfully registered rated the course')
	} catch {
		return new Response('Failed to rate the course')
	}
})
