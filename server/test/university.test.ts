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
				server.server.use('/university', (await import('../src/routes/course.ts')).default)
				server.server.use('/university', (await import('../src/routes/course/discussion.ts')).default)
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

describe('course tests', () => {
	test('create new courses for university', async () => {
		// create new courses
		const courseInfo1 = {
			name: 'Compiler construction and formal languages',
			code: 'D7050E'
		}
		const courseInfo2 = {
			name: 'Design of dynamic web systems',
			code: 'M7011E'
		}

		// first course
		const resPostCourse1 = await fetch('http://localhost:3000/university/Lulea-universitet/course', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(courseInfo1)
		})

		expect(resPostCourse1.status).toBe(201)

		// second course
		const resPostCourse2 = await fetch('http://localhost:3000/university/Lulea-universitet/course', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(courseInfo2)
		})

		expect(resPostCourse2.status).toBe(201)

		// check that course has been saved get all courses in database
		const resGetCourse = await fetch('http://localhost:3000/university/Lulea-universitet/course', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const courses: any = await resGetCourse.json()

		expect(resGetCourse.status).toBe(200)
		expect(courses[0].code).toBe('D7050E')
		expect(courses[1].code).toBe('M7011E')
	})

	test('search for one course', async () => {
		// get course M7011E
		const resGetCourse1 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const courses: any = await resGetCourse1.json()

		expect(resGetCourse1.status).toBe(200)
		expect(courses.name).toBe('Design of dynamic web systems')
		expect(courses.code).toBe('M7011E')

		// search for course that does not exist
		const resGetCourse2 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M0011E', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const noCourse: any = await resGetCourse2.text()

		expect(resGetCourse2.status).toBe(404)
		expect(noCourse).toBe('Could not find requested record')
	})

	test('delete course', async () => {
		// delete course D7050E
		const resDeleteCourse = await fetch('http://localhost:3000/university/Lulea-universitet/course/D7050E', {
			method: 'DELETE',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const deletedCourse: any = await resDeleteCourse.text()

		expect(resDeleteCourse.status).toBe(200)
		expect(deletedCourse).toBe('Course has been removed')

		// check that course is deleted
		const resGetDeleted = await fetch('http://localhost:3000/university/Lulea-universitet/course/D7050E', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const noCourse: any = await resGetDeleted.text()

		expect(resGetDeleted.status).toBe(404)
		expect(noCourse).toBe('Could not find requested record')
	})

	test('patch course', async () => {
		// patch course M7011E
		const newName = {
			name: 'Design of Dynamic Web Systems'
		}

		const resPatchCourse = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E', {
			method: 'PATCH',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(newName)
		})

		expect(resPatchCourse.status).toBe(200)

		// check that course info has been changed
		const resGetCourse1 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const courses: any = await resGetCourse1.json()

		expect(resGetCourse1.status).toBe(200)
		expect(courses.name).toBe('Design of Dynamic Web Systems')
		expect(courses.name).not.toBe('Design of dynamic web systems')
		expect(courses.code).toBe('M7011E')
	})
})

describe('discussion tests', () => {
	test('register new discussions of course', async () => {
		// create new discussions
		const discInfo1 = {
			subject: 'How do you build a website?',
			description: 'Does anybody know?'
		}
		const discInfo2 = {
			subject: 'What are some good ORMs in NodeJS?',
			description: 'Please do not suggest Sequelize'
		}

		// first discussion
		const resPostDisc1 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(discInfo1)
		})
		expect(resPostDisc1.status).toBe(201)

		// second discussion
		const resPostDisc2 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(discInfo2)
		})
		expect(resPostDisc2.status).toBe(201)

		// check that discussion has been saved get all discussions in database
		const resGetDiscussion = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const discussions: any = await resGetDiscussion.json()

		expect(resGetDiscussion.status).toBe(200)
		expect(discussions[0].subject).toBe('How do you build a website?')
		expect(discussions[1].subject).toBe('What are some good ORMs in NodeJS?')
	})

	test('search for discussion course of course', async () => {
		// search for discussion
		const resGetDiscussion = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const discussion: any = await resGetDiscussion.json()

		expect(resGetDiscussion.status).toBe(200)
		expect(discussion.subject).toBe('How do you build a website?')
	})

	test('delete discussion of course', async () => {
		// delete discussion What-are-some-good-ORMs-in-NodeJS
		const resDeleteDisc = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/What-are-some-good-ORMs-in-NodeJS', {
			method: 'DELETE',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const deletedDisc: any = await resDeleteDisc.text()

		expect(resDeleteDisc.status).toBe(200)
		expect(deletedDisc).toBe('The discussion has been removed')

		// check that the discussion is deleted
		const resGetDeleted = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/What-are-some-good-ORMs-in-NodeJS', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const noDisc: any = await resGetDeleted.text()

		expect(resGetDeleted.status).toBe(404)
		expect(noDisc).toBe('Could not find discussion about course')
	})

	test('patch discussion of course', async () => {
		// patch discussion of M7011E
		const newDesc = {
			description: 'I do not understand'
		}

		const resPatchDisc = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website', {
			method: 'PATCH',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(newDesc)
		})

		expect(resPatchDisc.status).toBe(200)

		// check that the discussion description has been changed
		const resGetDisc = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const discussion: any = await resGetDisc.json()

		expect(resGetDisc.status).toBe(200)

		expect(discussion.description).toBe('I do not understand')
		expect(discussion.name).not.toBe('Does anybody know?')
		expect(discussion.subject).toBe('How do you build a website?')
	})

	test('post comments on discussion', async () => {
		// create new comments
		const commentInfo1 = {
			commentText: 'Still have no figured it out'
		}
		const commentInfo2 = {
			commentText: 'I figured it out'
		}

		// first comment
		const resPostComment1 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website/comment', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(commentInfo1)
		})
		expect(resPostComment1.status).toBe(201)

		// second comment
		const resPostComment2 = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website/comment', {
			method: 'POST',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			},
			body: JSON.stringify(commentInfo2)
		})
		expect(resPostComment2.status).toBe(201)

		// check that comments has been saved, get all comments in discussion
		const resGetComment = await fetch('http://localhost:3000/university/Lulea-universitet/course/M7011E/discussion/How-do-you-build-a-website/comment', {
			method: 'GET',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json',
				Cookie: adminAuth
			}
		})
		const comments: any = await resGetComment.json()

		expect(resGetComment.status).toBe(200)
		console.log('COMMENTS:', comments)

		/* expect(discussions[0].subject).toBe('How do you build a website?')
		expect(discussions[1].subject).toBe('What are some good ORMs in NodeJS?') */
	})

	test('search for comment', async () => {})

	test('respond to comment', async () => {})

	test('delete comment', async () => {})

	test('patch comment', async () => {})
})

describe('participation tests', () => {})

describe('rating tests', () => {})

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
