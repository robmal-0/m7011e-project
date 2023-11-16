import server from './init'
import user from './routes/user'
import university from './routes/university'
import ratingCourse from './routes/ratingCourse'
import courseParticipation from './routes/courseParticipation'
import course from './routes/course'
import bannedUser from './routes/bannedUser'

server.server.use('/user', user)
server.server.use('/university', university)
server.server.use('/course/rating', ratingCourse)
server.server.use('/course/participation', courseParticipation)
server.server.use('/course', course)
server.server.use('/user/banned', bannedUser)

console.log(`Server listening at port ${server.port}`)
