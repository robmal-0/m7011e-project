import server from '../init'
import CourseParticipation from '../models/CourseParticipation'

const courseParticipationRouter = server.addGroup('courseParticipation')

courseParticipationRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		await CourseParticipation?.create({
			courseId: body.courseId,
			userId: body.userId,
			courseStart: body.courseStart,
			courseEnd: body.courseEnd
		})
		return new Response('Successfully registered for course')
	} catch {
		return new Response('Failed to register for course')
	}
})
