import express from 'express'
import { University } from '../models'
import { requireAdmin } from '../utils/auth_utils'
import slugify from 'slugify'

const universityRouter = express.Router()
// const universityAuthRouter = express.Router()

universityRouter.post('/', requireAdmin(), (req, res) => {
	// add check for admin status

	University?.findOrCreate({
		where: {
			name: req.body.name,
			slug: slugify(req.body.name),
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

universityRouter.get('/', (req, res) => {
	const options = {
		where: {} as any,
		attributes: [
			'name',
			'country',
			'city',
			'slug'
		]
	}

	if (req.query.name !== undefined) {
		options.where.name = req.query.name
	}
	if (req.query.city !== undefined) {
		options.where.city = req.query.city
	}
	if (req.query.country !== undefined) {
		options.where.country = req.query.country
	}

	University.findAll(options)
		.then((found) => {
			if (found !== null && found.length !== 0) {
				res.status(200)
				res.send(found)
			} else {
				res.status(404)
				res.send('No university could be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to search for universities')
		})
})

universityRouter.delete('/:uniSlug', requireAdmin(), (req, res) => {
	// check if user is admin, done

	University.destroy({
		where: {
			slug: req.params.uniSlug
		}
	})
		.then((result) => {
			if (result === 1) {
				res.status(200)
				res.send('Successfully removed university')
			} else {
				res.status(404)
				res.send('Could not find university to remove')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to remove university')
		})
})

universityRouter.patch('/:uniSlug', requireAdmin(), (req, res) => {
	// check if user is admin, done

	const newSlug = req.body.name !== undefined
		? slugify(req.body.name)
		: undefined

	University.update({
		name: req.body.name,
		slug: newSlug,
		country: req.body.country,
		city: req.body.city
	}, {
		where: {
			slug: req.params.uniSlug
		}
	})
		.then((saved) => {
			if (saved[0] === 1) {
				res.status(200)
				res.send('University information was updated')
			} else {
				res.status(404)
				res.send('Could not find university to be updated from given information')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to update university information')
		})
})

export default universityRouter
