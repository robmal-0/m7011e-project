import Admin, { type AdminType } from './Admin'
import User, { type UserType } from './User'
import University from './University'
import BannedUser from './BannedUser'
import CourseParticipation from './CourseParticipation'
import Course from './Course'
import Moderator from './Moderator'
import RatingCourse from './RatingCourse'
import DiscussionCourse from './DiscussionCourse'
import DiscussionComment from './DiscussionComment'

import type { ModelStatic, Model } from 'sequelize'

async function syncTable (table: ModelStatic<Model>): Promise<void> {
	await table.sync()
		.then(() => { console.log(`Created table ${table.name}`) })
		.catch((e) => { console.error(`Failed to create table ${table.name} ${e}`) })
}

async function syncAll (): Promise<void> {
	await syncTable(User)
	await syncTable(University)
	await syncTable(Admin)
	await syncTable(BannedUser)
	await syncTable(Course)
	await syncTable(CourseParticipation)
	await syncTable(Moderator)
	await syncTable(RatingCourse)
	await syncTable(DiscussionCourse)
	await syncTable(DiscussionComment)
}

void syncAll()

export {
	User,
	Admin,
	BannedUser,
	University,
	Course,
	CourseParticipation,
	Moderator,
	RatingCourse,
	DiscussionCourse,
	DiscussionComment,
	type UserType,
	type AdminType
}
