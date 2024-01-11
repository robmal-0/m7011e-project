import { DataTypes } from 'sequelize'
import { getServer } from '../Server'

const User = getServer().db.define('User', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	username: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
		validate: {
			min: 5
		}
	},
	email: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false,
		validate: {
			isEmail: true
		}
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false
	},
	age: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 15
		}
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			min: 1
		}
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
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

export default User
