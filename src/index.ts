import { createServer } from 'http'

const server = createServer()

server.listen(5000, () => {
    console.log('server up and running!')
})