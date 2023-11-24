import { DataTypes } from 'sequelize'
import server from '../init'
import User from '../models/User.ts'

const Moderator = server.db.define('Moderator', {
	userId: {
		type: DataTypes.INTEGER,
		primaryKey: true
	}
})

User.hasOne(Moderator, {
	foreignKey: 'userId'
})
Moderator.belongsTo(User, {
	foreignKey: 'userId'
})

export interface ModeratorType {
	userId: number
}

Moderator.sync()
	.then(() => { console.log('Created Moderator table') })
	.catch(() => { console.error('Failed to create Moderator table') })

export default Moderator
