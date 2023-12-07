import { test, beforeAll, expect, afterAll } from 'bun:test'
import Server from '../src/Server'
import userRouter from '../src/routes/user'

let port: number
beforeAll(async () => {
	await new Promise<void>((resolve, reject) => {
		// eslint-disable-next-line no-new
		new Server(3000, 'mysql://admin:pwd123@db_test:3306/db_test', (server: Server) => {
			port = server.port
			console.log(`Test server running at port ${port}`)
			server.db.authenticate().then(() => {
				console.log('Database up and running')
				// server.server.use('/user', userRouter)
				server.server.get('/test', (req, res) => { res.send('Hello!') })
				resolve()
			}).catch(() => {
				const msg = 'Failed to connect to database'
				console.log(msg)
				reject(msg)
			})
		})
	})
})

afterAll(() => {
	process.exit(0)
})

test('connect', async () => {
	const res = await fetch('http://localhost:3000/test', { method: 'GET' })
	console.log(res)
	expect(res.ok).toBe(true)
})
