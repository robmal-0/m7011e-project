import { DataTypes } from 'sequelize'
import server from '../init'
import Course from '../models/Course.ts'
import User from '../models/User.ts'

const DiscussionCourse = server.db.define('DiscussionCourse', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	courseId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	subject: {
		type: DataTypes.STRING(45),
		allowNull: false
	},
	description: {
		type: DataTypes.STRING(500),
		allowNull: true
	}
})

Course.hasOne(DiscussionCourse, {
	foreignKey: 'courseId'
})
DiscussionCourse.belongsTo(Course, {
	foreignKey: 'courseId'
})

User.hasOne(DiscussionCourse, {
	foreignKey: 'userId'
})
DiscussionCourse.belongsTo(Course, {
	foreignKey: 'userId'
})

DiscussionCourse.sync()
	.then(() => { console.log('Created DiscussionCourse table') })
	.catch(() => { console.error('Failed to create DiscussionCourse table') })

export default DiscussionCourse
