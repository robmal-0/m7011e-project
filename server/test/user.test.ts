import { test, beforeAll, expect, afterAll, describe } from 'bun:test'
import Server, { getServer, setServer } from '../src/Server'
import { QueryTypes, type Sequelize } from 'sequelize'

let port: number
let userAuth: string
let adminAuth: string

async function createUser (info: any): Promise<Response> {
	return await fetch('http://localhost:3000/user/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(info)
	})
}

beforeAll(async () => {
	await new Promise<void>((resolve, reject) => {
		// eslint-disable-next-line no-new
		new Server(3000, 'mysql://admin:pwd123@db_test:3306/db_test', (server: Server) => {
			setServer(server)
			port = server.port
			console.log(`Test server running at port ${port}`)
			server.db.authenticate().then(async () => {
				server.server.use('/user', (await import('../src/routes/user')).default)
				server.server.use('/user', (await import('../src/routes/user/admin')).default)
				server.server.use('/user', (await import('../src/routes/user/banned')).default)
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

describe('user tests', () => {
	test('connect', async () => {
		const res = await fetch('http://localhost:3000/user', { method: 'GET' })
		// console.log(res)
		expect(res.ok).toBe(true)
	})

	test('create user', async () => {
		const userInfo = {
			username: 'testuser',
			password: 'testpass',
			email: 'emailuser@testmail.test',
			age: 123,
			firstName: 'TestingUser',
			lastName: 'Name'
		}

		const res = await createUser(userInfo)

		// console.log(res)
		expect(res.ok).toBe(true)
	})

	test('login as user', async () => {
		const myUser = {
			username: 'testuser',
			password: 'testpass'
		}

		const res = await fetch('http://localhost:3000/user/login', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(myUser)
		})

		const auth = res.headers.getSetCookie()

		userAuth = auth[0].split(';', 1)[0]
		// console.log(userAuth)

		expect(res.ok).toBe(true)
	})

	test('authentication of user', async () => {
		const res = await fetch('http://localhost:3000/user/auth_token', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: userAuth
			}
		})
		expect(res.ok).toBe(true)
	})

	afterAll(async () => {
		const db = getServer().db
		await resetDatabase(db)
		/* await User.destroy({
			where: {},
			truncate: true
		}) */
	})
})

describe('admin tests', () => {
	let secondAdminId: { id: string }

	test('connect2', async () => {
		const res = await fetch('http://localhost:3000/user', { method: 'GET' })
		// console.log(res)
		expect(res.ok).toBe(true)
	})

	test('create admin', async () => {
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

		// will be used for future admin actions
		adminAuth = auth[0].split(';', 1)[0]

		const userId = JSON.parse(res.headers.get('x-user-data') ?? '{}')

		expect(res.ok).toBe(true)

		await getServer().db.query('INSERT INTO Admins (userId, createdAt, updatedAt) VALUES (1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP())')

		// get the admin
		const admin: any = (await getServer().db.query('SELECT * FROM Admins', { type: QueryTypes.SELECT }))[0]

		// confirm that the user just created is an admin
		expect(admin.userId).toBe(userId.id)
	})

	test('search for one specific admin', async () => {
		const res = await fetch('http://localhost:3000/user/1/admin', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		// console.log('status: ' + res.status)

		expect(res.ok).toBe(true)
	})

	test('search for all admins', async () => {
		const res = await fetch('http://localhost:3000/user/admin', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		// console.log(await res.json())

		expect(res.ok).toBe(true)
	})

	test('make other user admin', async () => {
		// create other user
		const userInfo = {
			username: 'testadmin2',
			password: 'testpass2',
			email: 'emailadmin2@testmail.test',
			age: 123,
			firstName: 'TestingAdmin2',
			lastName: 'Name2'
		}

		const resCreateUser = await createUser(userInfo)

		const userId = JSON.parse(resCreateUser.headers.get('x-user-data') ?? '{}')

		secondAdminId = userId

		// make that user into an admin using the API as previously created admin
		const resMakeAdmin = await fetch('http://127.0.0.1:3000/user/' + userId.id + '/admin', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		// confirm that the user is an admin
		expect(resMakeAdmin.status).toBe(201)
	})

	test('remove admin privileges', async () => {
		// remove users admin privileges
		await getServer().db.query('DELETE FROM Admins WHERE userId = ' + secondAdminId.id + '')

		// confirm user is no longer an admin
		const res = await fetch('http://localhost:3000/user/' + secondAdminId.id + '/admin', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		expect(res.status).toBe(404)
	})
})

describe('banned tests', () => {
	let bannedId: string

	test('ban a user', async () => {
		// create user to ban
		const userInfo = {
			username: 'testbanneduser',
			password: 'testbanned',
			email: 'emailbanned@testmail.test',
			age: 123,
			firstName: 'TestingBanned',
			lastName: 'Name'
		}

		const resBannedUser = await createUser(userInfo)

		const bannedUserInfo = JSON.parse(resBannedUser.headers.get('x-user-data') ?? '{}')

		bannedId = bannedUserInfo.id

		// ban user
		const banInfo = {
			unbanDate: '2023-12-24'
		}

		const resBanUser = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(banInfo)
		})

		expect(resBanUser.status).toBe(201)

		// confirm that user has been banned
		const resBanInfo = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const bannedGet: any = await resBanInfo.json()

		expect(bannedGet[0].userId).toBe(bannedId)
	})

	test('search for banned user', async () => {
		// get information about banned user
		const res = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		// confirm that information has been received
		expect(res.ok).toBe(true)
	})

	test('search for all banned users', async () => {
		// get information about banned users
		const res = await fetch('http://localhost:3000/user/banned/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		// confirm that information has been received
		expect(res.ok).toBe(true)
	})

	test('update unban date for user', async () => {
		// update the date that a banned user is unbanned
		const newDate = {
			unbanDate: '2023-12-28'
		}

		const res = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'PATCH',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(newDate)
		})

		expect(res.status).toBe(200)

		// confirm that the information has been updated
		const resDate = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		const unbanDate: any = await resDate.json()

		expect(unbanDate[0].unbanDate).toBe('2023-12-28')
	})

	test('unban a user', async () => {
		// remove user from banned list
		const res = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'DELETE',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})

		expect(res.status).toBe(200)

		// confirm that the user has been unbanned
		const resDate = await fetch('http://localhost:3000/user/' + bannedId + '/banned/', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			}
		})

		expect(resDate.status).toBe(404)
	})
})

describe('moderator tests', () => {
	test('create moderator', async () => {
		// Should a moderator be for whole website or specific courses?

		// confirm user is moderator
	})

	test('search for moderator', async () => {
		// Search for moderator by id

		// confirm that moderator has been found
	})

	test('search for all moderator', async () => {
		// Search for all moderators

		// confirm that information has been received
	})

	test('remove moderator privileges', async () => {
		// Remove moderator privileges for user

		// confirm that moderator privileges have been removed
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
		await db.sync({ force: true })

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
