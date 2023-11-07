import Listener from './Listener'
import { Sequelize } from 'sequelize'

export default class Server {
	server
	port
	listener
	db
	addListener
	addGroup

	constructor (port: number, dbUrl?: string) {
		this.port = port
		if (dbUrl !== undefined) {
			this.db = new Sequelize(dbUrl)
			this.db.authenticate({ logging: false })
				.then(() => { console.log('Database connection astablished') })
				.catch(() => { console.error('Database connection failed') })
		}
		this.listener = new Listener('', (req) => {
			return new Response(`Could not resolve path ${new URL(req.url).pathname}`, { status: 404 })
		})
		this.server = Bun.serve({
			fetch: (req): Response => {
				return this.listener.match(new URL(req.url).pathname, req) ??
					this.listener.match('', req) ??
					new Response('An error occured', { status: 404 })
			},
			port
		})
		this.addListener = this.listener.addListener.bind(this.listener)
		this.addGroup = this.listener.addGroup.bind(this.listener)
	}
}
