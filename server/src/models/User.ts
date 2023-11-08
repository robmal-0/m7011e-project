import { DataTypes } from 'sequelize'
import server from '../init'

const User = server.db?.define('User', {
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
		type: DataTypes.STRING
	},
	age: {
		type: DataTypes.INTEGER
	},
	firstName: {
		type: DataTypes.STRING
	},
	lastName: {
		type: DataTypes.STRING
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

User?.sync()
	.then(() => { console.log('Created User table') })
	.catch(() => { console.error('Failed to create User table') })

export default User
