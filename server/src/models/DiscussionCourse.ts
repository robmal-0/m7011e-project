import { DataTypes } from 'sequelize'
import server from '../init'
import Course from '../models/Course.ts'

const DiscussionCourse = server.db.define('DiscussionCourse', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false
	},
	idCourse: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	discussionSubject: {
		type: DataTypes.STRING(45),
		allowNull: false
	},
	discussionDescription: {
		type: DataTypes.STRING(500),
		allowNull: true
	}
})

Course.hasOne(DiscussionCourse, {
	foreignKey: 'idCourse'
})
DiscussionCourse.belongsTo(Course, {
	foreignKey: 'idCourse'
})

DiscussionCourse.sync()
	.then(() => { console.log('Created DiscussionCourse table') })
	.catch(() => { console.error('Failed to create DiscussionCourse table') })

export default DiscussionCourse
