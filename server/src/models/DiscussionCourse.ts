import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import Course from '../models/Course.ts'
import User from '../models/User.ts'

const DiscussionCourse = getServer().db.define('DiscussionCourse', {
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
		allowNull: false,
		unique: true
	},
	slug: {
		type: DataTypes.STRING(45),
		allowNull: false,
		unique: true
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

export default DiscussionCourse
