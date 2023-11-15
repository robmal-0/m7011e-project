import userReducer from './userReducer'
import { setUser } from './user'

export const reducers = {
	currentUser: userReducer
}

export const actions = {
	userActions: { setUser }
}
