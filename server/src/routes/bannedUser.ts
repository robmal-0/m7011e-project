import server from '../init'
import Course from '../models/BannedUser'
import { verifyAdmin } from '../utils/token_verify'

const bannedUserRouter = server.addGroup('bannedUser')

bannedUserRouter.addListener('register', async (req) => {
	if (req.method !== 'POST') return new Response(`Method ${req.method} not allowed`)

	try {
		const body: any = await req.json()
		// const inputUserId: number = Number(body.userId)
		const isAdmin: boolean = await verifyAdmin(req)

		if (isAdmin) { // is admin
			await Course?.create({
				userId: body.userId,
				unbanDate: body.unbanDate
			})
			return new Response('Successfully created banned user with ID: ' + body.userId)
		} else {
			throw new Error('User is not an admin')
		}
	} catch (e) {
		console.error(e)
		return new Response('Failed to ban user')
	}
})
