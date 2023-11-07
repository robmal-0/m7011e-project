import server from './init'

// Group for /hej
const hej = server.addGroup('hej')

// listener for /hej/da
hej.addListener('da', (path) => {
	return new Response('Hej då!')
})

console.log(`Server listening at port ${server.port}`)
