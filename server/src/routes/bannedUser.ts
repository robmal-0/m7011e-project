import server from '../init'
import Course from '../models/BannedUser'

const bannedUserRouter = server.addGroup('bannedUser')

bannedUserRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	// need to add something to confirm the user is allowed to ban users

	try {
		const body: any = await req.json()
		await Course?.create({
			userId: body.userId,
			unbanDate: body.unbanDate
		})
		return new Response('Successfully created banned user with ID: ' + body.userId)
	} catch {
		return new Response('Failed to ban user')
	}
})
