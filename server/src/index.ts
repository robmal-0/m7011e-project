import './init'

import user from './routes/user'
import university from './routes/university'
import course from './routes/course'

import admin from './routes/user/admin'
import moderator from './routes/user/moderator'
import banned from './routes/user/banned'

import participation from './routes/course/participation'
import rating from './routes/course/rating'
import discussion from './routes/course/discussion'
import { getServer } from './Server'

const server = getServer()

server.server.use('/user', user)
server.server.use('/user', admin)
server.server.use('/user', moderator)
server.server.use('/user', banned)
server.server.use('/university', university)
server.server.use('/university', course)
server.server.use('/university', participation)
server.server.use('/university', discussion)
server.server.use('/university', rating)

console.log(`Server listening at port ${server.port}`)
