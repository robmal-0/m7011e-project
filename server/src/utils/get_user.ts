import _ from 'lodash'
import User, { type UserType } from '../models/User'
import Admin from '../models/Admin'
import Moderator from '../models/Moderator'

export enum Privilages {
	USER = 0,
	MODERATOR = 1,
	ADMIN = 2
}

export interface UserResult {
	user: UserType
	privilages: Privilages
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

	// TODO: Set privilages
	let privilages = Privilages.USER

	let res = await Moderator.findOne({ where: { userId: user.id } })
	if (res !== undefined) privilages = Privilages.MODERATOR
	res = await Admin.findOne({ where: { userId: user.id } })
	if (res !== undefined) privilages = Privilages.ADMIN

	return {
		user,
		privilages
	}
})
