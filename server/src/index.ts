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

const apiVersion = '/v1'

server.server.use(apiVersion + '/user', user)
server.server.use(apiVersion + '/user', admin)
server.server.use(apiVersion + '/user', moderator)
server.server.use(apiVersion + '/user', banned)
server.server.use(apiVersion + '/university', university)
server.server.use(apiVersion + '/university', course)
server.server.use(apiVersion + '/university', participation)
server.server.use(apiVersion + '/university', discussion)
server.server.use(apiVersion + '/university', rating)

console.log(`Server listening at port ${server.port}`)
