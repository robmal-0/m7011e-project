import Server, { setServer } from './Server'

console.log('INITIALIZED SERVER!')

const server = new Server(3000, 'mysql://admin:pwd123@db:3306/db')
setServer(server)
