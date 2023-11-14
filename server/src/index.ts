import server from './init'
import user from './routes/user'
// import './routes/university'
// import './routes/course'
// import './routes/courseParticipation'
// import './routes/ratingCourse'
// import './routes/bannedUser'

server.server.use('/user', user)

console.log(`Server listening at port ${server.port}`)
