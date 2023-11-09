import { DataTypes } from 'sequelize'
import server from '../init'
import University from './University'

const Course = server.db.define('Course', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING(45),
		allowNull: false
	},
	code: {
		type: DataTypes.STRING(45),
		allowNull: false
	}
})

University.hasMany(Course, {
	foreignKey: 'uniId'
})
Course.belongsTo(University, {
	foreignKey: 'uniId'
})

/* export interface CourseType {
	id: number
	name: string
	code: string
} */

Course.sync()
	.then(() => { console.log('Created Course table') })
	.catch((e) => { console.error('Failed to create Course table: ' + e) })

export default Course
