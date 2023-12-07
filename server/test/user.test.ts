import { test, beforeAll, expect, afterAll } from 'bun:test'
import Server, { setServer } from '../src/Server'

let port: number
beforeAll(async () => {
	await new Promise<void>((resolve, reject) => {
		// eslint-disable-next-line no-new
		new Server(3000, 'mysql://admin:pwd123@db_test:3306/db_test', (server: Server) => {
			setServer(server)
			port = server.port
			console.log(`Test server running at port ${port}`)
			server.db.authenticate().then(async () => {
				server.server.use('/user', (await import('../src/routes/user')).default)
				console.log('Database up and running')
				resolve()
			}).catch((e) => {
				console.error(e)
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
	const res = await fetch('http://localhost:3000/user', { method: 'GET' })
	console.log(res)
	expect(res.ok).toBe(true)
})
