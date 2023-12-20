import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import Course from './Course'
import User from './User'

const CourseParticipation = getServer().db.define('CourseParticipation', {
	courseId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	courseStart: {
		type: DataTypes.DATEONLY,
		allowNull: false
	},
	courseEnd: {
		type: DataTypes.DATEONLY,
		allowNull: false
	}
})

Course.hasMany(CourseParticipation, {
	foreignKey: 'courseId'
})
CourseParticipation.belongsTo(Course, {
	foreignKey: 'courseId'
})

User.hasMany(CourseParticipation, {
	foreignKey: 'userId'
})
CourseParticipation.belongsTo(User, {
	foreignKey: 'userId'
})

/* export interface CourseType {
	id: number
	name: string
	code: string
} */

export default CourseParticipation
