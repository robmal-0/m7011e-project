import type { UserState, UserAction } from './user'

const defaultState: UserState = {
	user: undefined
}

export default (state: UserState = defaultState, action: UserAction): any => {
	switch (action.type) {
		case 'SET_USER':
			state.user = action.payload
			break
		default:
			return state
	}
}
