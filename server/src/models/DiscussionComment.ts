import { DataTypes } from 'sequelize'
import server from '../init'
import DiscussionCourse from '../models/DiscussionCourse.ts'
import User from '../models/User.ts'

const DiscussionComment = server.db.define('DiscussionComment', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false
	},
	idDiscussionCourse: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	idUser: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	commentText: {
		type: DataTypes.STRING(1000),
		allowNull: false
	},
	responseTo: {
		type: DataTypes.INTEGER,
		allowNull: true
	}
})

DiscussionCourse.hasMany(DiscussionComment, {
	foreignKey: 'idDiscussionCourse'
})
DiscussionComment.belongsTo(DiscussionCourse, {
	foreignKey: 'idDiscussionCourse'
})

User.hasMany(DiscussionComment, {
	foreignKey: 'idUser'
})
DiscussionComment.belongsTo(User, {
	foreignKey: 'idUser'
})

// References another discussion comment
DiscussionComment.hasOne(DiscussionComment, {
	foreignKey: 'responseTo'
})
DiscussionComment.belongsTo(DiscussionComment, {
	foreignKey: 'responseTo'
})

DiscussionComment.sync()
	.then(() => { console.log('Created DiscussionComment table') })
	.catch(() => { console.error('Failed to create DiscussionComment table') })

export default DiscussionComment
