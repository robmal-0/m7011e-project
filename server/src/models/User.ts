import { DataTypes } from 'sequelize'
import server from '../init'

export default server.db?.define('User', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true
	}
})
