import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import Course from './Course'
import User from './User'

const RatingCourse = getServer().db.define('RatingCourse', {
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	courseId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	stars: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			max: 5,
			min: 1
		}
	}
})

Course.hasMany(RatingCourse, {
	foreignKey: 'courseId'
})
RatingCourse.belongsTo(Course, {
	foreignKey: 'courseId'
})

User.hasMany(RatingCourse, {
	foreignKey: 'userId'
})
RatingCourse.belongsTo(User, {
	foreignKey: 'userId'
})

RatingCourse.sync()
	.then(() => { console.log('Created RatingCourse table') })
	.catch((e) => { console.error('Failed to create RatingCourse table: ' + e) })

export default RatingCourse
