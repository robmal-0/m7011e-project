import { test, beforeAll, expect, afterAll, describe } from 'bun:test'
import Server, { getServer, setServer } from '../src/Server'
import { QueryTypes, type Sequelize } from 'sequelize'

let port: number
let adminAuth: string

async function createUser (info: any): Promise<Response> {
	const res = await fetch('http://localhost:3000/user/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(info)
	})

	return res
}

beforeAll(async () => {
	await new Promise<void>((resolve, reject) => {
		// eslint-disable-next-line no-new
		new Server(3000, 'mysql://admin:pwd123@db_test:3306/db_test', (server: Server) => {
			setServer(server)
			port = server.port
			console.log(`Test server running at port ${port}`)
			server.db.authenticate().then(async () => {
				await resetDatabase(server.db)
				server.server.use('/user', (await import('../src/routes/user')).default)
				server.server.use('/user', (await import('../src/routes/user/admin')).default)
				server.server.use('/university', (await import('../src/routes/university')).default)
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

describe('university tests', () => {
	test('create admin user', async () => {
		// create admin user (will be used for other tests)
		const userInfo = {
			username: 'testadmin',
			password: 'testpass',
			email: 'emailadmin@testmail.test',
			age: 123,
			firstName: 'TestingAdmin',
			lastName: 'Name'
		}

		const res = await createUser(userInfo)

		const auth = res.headers.getSetCookie()

		adminAuth = auth[0].split(';', 1)[0]

		const userId = JSON.parse(res.headers.get('x-user-data') ?? '{}')

		expect(res.ok).toBe(true)

		await getServer().db.query('INSERT INTO Admins (userId, createdAt, updatedAt) VALUES (1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())')

		const admin: any = (await getServer().db.query('SELECT * FROM Admins', { type: QueryTypes.SELECT }))[0]

		// confirm that the user just created is an admin
		expect(admin.userId).toBe(userId.id)
	})

	test('register new universities', async () => {
		// create two universities

		// make sure universities have been created
	})

	test('search for university', () => {
		// search for specific university using different queries

		// confirm correct information

		// search for all universities

		// confirm correct information
	})

	test('remove university', () => {
		// remove one university

		// confirm that university has been removed
	})

	test('patch university', () => {
		// change name of the university

		// confirm that name has been changed
	})
})

afterAll(async () => {
	const db = getServer().db
	await resetDatabase(db)
	await closeConnection(db)
	process.exit(0)
})

async function resetDatabase (db: Sequelize): Promise<any> {
	try {
		// Drop all tables
		await db.drop()

		// Recreate the tables
		const syncAll = (await import('../src/models')).syncAll
		await syncAll()

		console.log('--------------------------------------')
		console.log('Database reset successfully.')
		console.log('--------------------------------------')
	} catch (error) {
		console.error('Error resetting database:', error)
	}
}

async function closeConnection (db: Sequelize): Promise<any> {
	await db.close()
}
