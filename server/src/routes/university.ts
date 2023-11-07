import server from '../init'
import University from '../models/University'

const universityRouter = server.addGroup('university')

universityRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		await University?.create({
			name: body.name,
			country: body.country,
			city: body.city
		})
		return new Response('Successfully created university: ' + body.name)
	} catch {
		return new Response('Failed to register university')
	}
})
