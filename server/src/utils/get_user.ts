import _ from 'lodash'
import { User, Admin, Moderator, type UserType, BannedUser } from '../models'

export enum Privileges {
	USER = 0,
	MODERATOR = 1,
	ADMIN = 2
}

export interface UserResult {
	user: UserType
	privileges: Privileges
	bannedTill?: Date
}

type Key = 'id' | 'username'

export const getUser = _.memoize(async (key: Key, value: any): Promise<UserResult | undefined> => {
	const result = await User.findOne({ where: { [key]: value } }) as any

	if (result == null) {
		return
	}

	const user: UserType = {
		id: result.id,
		username: result.username,
		email: result.email,
		age: result.age,
		password: result.password,
		firstName: result.firstName,
		lastName: result.lastName
	}

	// TODO: Set privileges
	let privileges = Privileges.USER

	const bu = await BannedUser.findOne({ where: { userId: user.id } }) as any
	const bannedTill = bu !== null ? new Date(bu.unbanDate) : undefined

	let res = await Moderator.findOne({ where: { userId: user.id } })
	if (res !== null) privileges = Privileges.MODERATOR
	res = await Admin.findOne({ where: { userId: user.id } })
	if (res !== null) privileges = Privileges.ADMIN

	return {
		user,
		privileges,
		bannedTill
	}
}, (key, value) => {
	return [key, value]
})
