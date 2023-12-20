import { DataTypes } from 'sequelize'
import { getServer } from '../Server'

const University = getServer().db.define('University', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING(45),
		unique: true,
		allowNull: false
	},
	country: {
		type: DataTypes.STRING(45),
		allowNull: false
	},
	city: {
		type: DataTypes.STRING(45),
		allowNull: false
	}
})

export default University
