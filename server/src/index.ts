import server from './init'
import './routes/user'
import './routes/university'
import './routes/course'
import './routes/courseParticipation'
import './routes/ratingCourse'
import './routes/bannedUser'

console.log(`Server listening at port ${server.port}`)
