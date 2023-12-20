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

User.hasMany(Moderator, {
	foreignKey: 'userId'
})
Course.hasMany(Moderator, {
	foreignKey: 'courseId'
})
Moderator.belongsTo(User, {
	foreignKey: 'userId'
})

export interface ModeratorType {
	userId: number
}

export default Moderator
