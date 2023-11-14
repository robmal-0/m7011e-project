interface SetUserAction {
	type: string
	payload: User
}

export type UserAction = SetUserAction

export const setUser = (user: User): SetUserAction => {
	return {
		type: 'SET_USER',
		payload: user
	}
}

export interface UserState {
	user?: User
}
