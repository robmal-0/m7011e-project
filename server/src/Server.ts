import { Sequelize } from 'sequelize'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

export default class Server {
	server
	port
	db

	constructor (port: number, dbUrl: string) {
		this.port = port
		// if (dbUrl !== undefined) {
		this.db = new Sequelize(dbUrl, { logging: false })
		this.db.authenticate()
			.then(() => { console.log('Database connection established, port: ' + port + ' URL: ' + dbUrl) })
			.catch((e) => { console.error('Database connection failed: ' + e) })
		this.server = express()
		this.server.use(cors({
			credentials: true,
			origin: 'http://localhost:7500'
		}))
		this.server.use(cookieParser())
		this.server.use(express.json())
		this.server.use((req, res, next) => {
			res.setHeader('Access-Control-Expose-Headers', 'X-User-Data')
			next()
		})

		this.server.listen(this.port, () => {})
	}
}
