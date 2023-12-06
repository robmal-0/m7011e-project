import server from './init'
import user from './routes/user'
import university from './routes/university'
import course from './routes/course'

import admin from './routes/user/admin'
import moderator from './routes/user/moderator'
import banned from './routes/user/banned'

import participation from './routes/course/participation'
import rating from './routes/course/rating'
import discussion from './routes/course/discussion'

server.server.use('/user', user)
server.server.use('/user', admin)
server.server.use('/user', moderator)
server.server.use('/user', banned)
server.server.use('/university', university)
server.server.use('/course', course)
server.server.use('/course', participation)
server.server.use('/course', rating)
server.server.use('/course', discussion)
server.server.get('/test', (req, res) => {
	res.send('Hej')
})

console.log(`Server listening at port ${server.port}`)
