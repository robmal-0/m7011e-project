import express from 'express'
import University from '../models/University'

const universityRouter = express.Router()

universityRouter.post('/', (req, res) => {
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

universityRouter.get('/', (req, res) => {
	const options = {
		where: {} as any,
		attributes: [
			'name',
			'country',
			'city'
		]
	}

	if (req.query.name !== undefined) {
		options.where.name = req.query.name
	}
	if (req.query.city !== undefined) {
		options.where.city = req.query.city
	}
	if (req.query.city !== undefined) {
		options.where.country = req.query.country
	}

	University.findAll(options)
		.then((found) => {
			if (found !== null) {
				res.status(201)
				res.send(found)
			} else {
				res.status(200)
				res.send('No universities could be found')
			}
		})
		.catch((e) => {
			console.error(e)
			res.status(500)
			res.send('Failed to search for universities')
		})
})

universityRouter.delete('/:uniId', (req, res) => {
	// check if user is admin

	University.destroy({
		where: {
			id: req.params.uniId
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

universityRouter.patch('/:uniId', (req, res) => {
	// check if user is admin

	University.update(req.body, {
		where: {
			id: req.params.uniId
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
