import { DataTypes } from 'sequelize'
import { getServer } from '../Server'
import RatingCourse from '../models/RatingCourse.ts'

const ReviewCourse = getServer().db.define('ReviewCourse', {
	idRating: {
		type: DataTypes.INTEGER,
		primaryKey: true
	},
	reviewText: {
		type: DataTypes.STRING(500),
		allowNull: false
	}
})

RatingCourse.hasOne(ReviewCourse, {
	foreignKey: 'idRating'
})
ReviewCourse.belongsTo(RatingCourse, {
	foreignKey: 'idRating'
})

ReviewCourse.sync()
	.then(() => { console.log('Created ReviewCourse table') })
	.catch((e) => { console.error('Failed to create ReviewCourse table: ' + e) })

export default ReviewCourse
