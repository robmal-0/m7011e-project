import server from '../init'
import Course from '../models/Course'

const courseRouter = server.addGroup('course')

courseRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		await Course?.create({
			name: body.name,
			code: body.code,
			uniId: body.uniId
		})
		return new Response('Successfully created course: ' + body.name)
	} catch {
		return new Response('Failed to register course')
	}
})
