import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import User from '../models/User'

const BannedUser = getServer().db.define('BannedUser', {
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	unbanDate: {
		type: DataTypes.DATEONLY,
		defaultValue: null
	}
})

User.hasMany(BannedUser, {
	foreignKey: 'userId'
})
BannedUser.belongsTo(User, {
	foreignKey: 'userId'
})

BannedUser.sync()
	.then(() => { console.log('Created BannedUser table') })
	.catch(() => { console.error('Failed to create BannedUser table') })

export default BannedUser
