import { DataTypes } from 'sequelize'
import server from '../init'

const User = server.db.define('User', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
	age: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	userType: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1,
		validate: { // 1 = user, 2 = moderator, 3 = admin
			max: 3,
			min: 1
		}
	}
})

export interface UserType {
	id: number
	username: string
	email: string
	password: string
	age: number
	firstName: string
	lastName: string
}

User.sync()
	.then(() => { console.log('Created User table') })
	.catch(() => { console.error('Failed to create User table') })

export default User
