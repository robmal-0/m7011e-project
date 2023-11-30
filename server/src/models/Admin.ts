import { DataTypes } from 'sequelize'
import server from '../init'
import User from '../models/User.ts'

const Admin = server.db.define('Admin', {
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

Admin.sync()
	.then(() => { console.log('Created Admin table') })
	.catch(() => { console.error('Failed to create Admin table') })

export default Admin
