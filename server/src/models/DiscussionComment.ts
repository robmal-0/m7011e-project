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
	localId: { // given to comments in a discussion, the first comment will have localId = 0
		type: DataTypes.INTEGER,
		allowNull: false
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
DiscussionComment.belongsTo(DiscussionComment, {
	foreignKey: 'responseTo',
	as: 'parentComment'
})
DiscussionComment.hasMany(DiscussionComment, {
	foreignKey: 'responseTo',
	as: 'replies'
})

/* DiscussionComment.sync()
	.then(() => { console.log('Created DiscussionComment table') })
	.catch(() => { console.error('Failed to create DiscussionComment table') }) */

export default DiscussionComment
