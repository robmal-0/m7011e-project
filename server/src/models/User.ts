import { DataTypes } from 'sequelize'
import server from '../init'

const User = server.db?.define('User', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING
	},
	email: {
		type: DataTypes.STRING
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

User?.sync()
	.then(() => { console.log('Created User table') })
	.catch(() => { console.error('Failed to create User table') })

export default User
