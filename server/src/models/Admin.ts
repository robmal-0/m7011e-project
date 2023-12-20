import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import User from '../models/User.ts'

const Admin = getServer().db.define('Admin', {
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	}
})

User.hasOne(Admin, {
	foreignKey: 'userId'
})
Admin.belongsTo(User, {
	foreignKey: 'userId'
})

export interface AdminType {
	userId: number
}

export default Admin
