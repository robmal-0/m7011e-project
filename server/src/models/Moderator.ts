import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import User from '../models/User.ts'
import Course from './Course.ts'

const Moderator = getServer().db.define('Moderator', {
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	courseId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	}
})

User.belongsToMany(Course, {
	through: Moderator,
	foreignKey: 'userId'
})
Moderator.belongsTo(User, { foreignKey: 'userId' })
Course.belongsToMany(User, {
	through: Moderator,
	foreignKey: 'courseId'
})
Moderator.belongsTo(Course, { foreignKey: 'courseId' })

export interface ModeratorType {
	userId: number
}

export default Moderator
