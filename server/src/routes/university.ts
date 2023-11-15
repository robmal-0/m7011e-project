import express from 'express'
/* import bcrypt from 'bcryptjs'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../utils/token_verify' */
import University from '../models/University'

const universityRouter = express.Router()

universityRouter.post('/register', (req, res) => {
	// add check for admin status

	University?.findOrCreate({
		where: {
			name: req.body.name,
			country: req.body.country,
			city: req.body.city
		}
	})
		.then(([user, created]) => {
			if (created) {
				res.status(201)
				res.send('Successfully registered new university')
			} else {
				res.status(200)
				res.send('University already exists')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to register new university')
		})
})

export default universityRouter
