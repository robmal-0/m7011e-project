import server from './init'
import user from './routes/user'
import university from './routes/university'
import course from './routes/course'

server.server.use('/user', user)
server.server.use('/university', university)
server.server.use('/course', course)

console.log(`Server listening at port ${server.port}`)
