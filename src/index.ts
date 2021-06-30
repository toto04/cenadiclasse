import fastify from 'fastify'
import env from 'dotenv'
import { Pool } from 'pg'
env.config()
console.clear()
let pool = new Pool(process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL, ssl: true }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
let server = fastify()

server.get('/getall', async (req, res) => {
    let db = await pool.connect()
    let q = await db.query<{ name: string, dates: string }>('SELECT name, dates FROM cenadiclasse')
    let all = q.rows
    db.release()
})

server.post('/dates', async (req, res) => {
    let asd: { name: string, dates: string[][] } = req.body as any
    let db = await pool.connect()
    console.log(`nuova richiesta! da ${asd.name}, date: ${JSON.stringify(asd.dates)}`)
    await db.query({
        text: 'INSERT INTO cenadiclasse VALUES ($1, $2)',
        values: [asd.name, JSON.stringify(asd.dates)]
    })
    res.send()
    db.release()
})

let start = async () => {
    let p = await server.listen(process.env.PORT ?? 5000)
    console.log('Server up and running on address ' + p)
}

start()