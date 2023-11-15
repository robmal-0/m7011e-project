import type { UserState, UserAction } from './user'

const defaultState: UserState = {
	user: undefined
}

export default (state: UserState = defaultState, action: UserAction): any => {
	switch (action.type) {
		case 'SET_USER':
			return { user: action.payload }
		default:
			return state
	}
}
