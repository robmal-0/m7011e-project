import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import DiscussionCourse from '../models/DiscussionCourse.ts'
import User from '../models/User.ts'

const DiscussionComment = getServer().db.define('DiscussionComment', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true
	},
	discussionCourseId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	userId: {
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
	foreignKey: 'discussionCourseId'
})
DiscussionComment.belongsTo(DiscussionCourse, {
	foreignKey: 'discussionCourseId'
})

User.hasMany(DiscussionComment, {
	foreignKey: 'userId'
})
DiscussionComment.belongsTo(User, {
	foreignKey: 'userId'
})

// References another discussion comment
DiscussionComment.hasOne(DiscussionComment, {
	foreignKey: 'responseTo'
})
DiscussionComment.belongsTo(DiscussionComment, {
	foreignKey: 'responseTo'
})

export default DiscussionComment
