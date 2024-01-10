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
		const uniInfo1 = {
			name: 'Umeå universitet',
			country: 'Sweden',
			city: 'Umeå'
		}
		const uniInfo2 = {
			name: 'Luleå tekniska universitet',
			country: 'Sweden',
			city: 'Luleå'
		}

		// first university
		const resPostUni1 = await fetch('http://localhost:3000/university/', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(uniInfo1)
		})

		expect(resPostUni1.status).toBe(201)

		// second university
		const resPostUni2 = await fetch('http://localhost:3000/university/', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(uniInfo2)
		})

		expect(resPostUni2.status).toBe(201)

		// make sure universities have been created

		const resGetUni = await fetch('http://localhost:3000/university/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const universities: any = await resGetUni.json()

		expect(universities[0].name).toBe('Umeå universitet')
		expect(universities[1].name).toBe('Luleå tekniska universitet')
	})

	test('search for university', async () => {
		// search for specific university using different queries

		// LTU in Luleå
		const resGetUni1 = await fetch('http://localhost:3000/university/?city=Luleå&country=Sweden&name=Luleå tekniska universitet', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const university1: any = await resGetUni1.json()

		// Umeå universitet in Umeå
		const resGetUni2 = await fetch('http://localhost:3000/university/?city=Umeå&country=Sweden&name=Umeå universitet', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const university2: any = await resGetUni2.json()

		// Umeå universitet in Luleå, fails
		const resGetUni3 = await fetch('http://localhost:3000/university/?city=Luleå&country=Sweden&name=Umeå universitet', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const university3: any = await resGetUni3.text()

		// confirm correct information
		expect(resGetUni1.status).toBe(200)
		expect(resGetUni2.status).toBe(200)
		expect(resGetUni3.status).toBe(404)

		expect(university1[0].name).toBe('Luleå tekniska universitet')
		expect(university2[0].name).toBe('Umeå universitet')
		expect(university3).toBe('No university could be found')
	})

	test('remove university', async () => {
		// remove university
		const resDelUni = await fetch('http://localhost:3000/university/Umea-universitet', {
			method: 'DELETE',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		expect(resDelUni.status).toBe(200)

		// confirm that university has been removed

		const resGetUni = await fetch('http://localhost:3000/university/?city=Umeå&country=Sweden&name=Umeå universitet', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const university: any = await resGetUni.text()

		expect(resGetUni.status).toBe(404)
		expect(university).toBe('No university could be found')
	})

	test('patch university', async () => {
		// change name of the university
		const newName = {
			name: 'Luleå universitet'
		}

		const resPatchUni = await fetch('http://localhost:3000/university/Lulea-tekniska-universitet', {
			method: 'PATCH',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(newName)
		})

		// confirm that name has been changed

		const resGetUni = await fetch('http://localhost:3000/university/?city=Luleå', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const university: any = await resGetUni.json()

		expect(resPatchUni.status).toBe(200)
		expect(university[0].name).toBe('Luleå universitet')
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
