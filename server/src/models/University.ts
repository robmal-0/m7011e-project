import { DataTypes } from 'sequelize'
import server from '../init'

const University = server.db?.define('University', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		unique: true,
		allowNull: false,
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

University?.sync()
	.then(() => { console.log('Created University table') })
	.catch(() => { console.error('Failed to create University table') })

export default University
