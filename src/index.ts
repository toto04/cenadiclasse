import fastify from 'fastify'
import fastify_static from 'fastify-static'
import env from 'dotenv'
import { Pool } from 'pg'
import path from 'path'
import fs from 'fs'

env.config()
console.clear()
let pool = new Pool(process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL, ssl: {
            rejectUnauthorized: false
        }
    }
    : {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
let server = fastify()

let readfile = (path: string) => new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
        if (err) {
            rej(err)
            return
        }
        res(data)
    })
})

server.get('/supersecret', async (req, res) => {
    let db = await pool.connect()
    let q = await db.query<{ name: string, dates: [string, string][] }>('SELECT name, dates FROM cenadiclasse')
    let all: { [name: string]: [string, string][] } = {}
    q.rows.forEach(r => {
        all[r.name] = r.dates
    })
    res.send(all)
    db.release()
})

server.get('/getall', async (req, res) => {
    let db = await pool.connect()
    let q = await db.query<{ dates: [string, string][] }>('SELECT dates FROM cenadiclasse')
    let all = q.rows.map(r => r.dates)
    res.send(all)
    db.release()
})

server.get('/people', async (req, res) => {
    let db = await pool.connect()
    let q = await db.query<{ name: string }>('SELECT name FROM cenadiclasse ORDER BY name')
    let ppl = q.rows.map(r => r.name)
    res.send(ppl)
    db.release()
})

server.post('/dates', async (req, res) => {
    let asd: { name: string, dates: string[][] } = req.body as any
    let db = await pool.connect()
    console.log(`nuova richiesta! da ${asd.name}, date: ${JSON.stringify(asd.dates)}`)
    await db.query({
        text: 'INSERT INTO cenadiclasse VALUES ($1, $2) ON CONFLICT ON CONSTRAINT cenadiclasse_pkey DO UPDATE SET dates=$2',
        values: [asd.name, JSON.stringify(asd.dates)]
    })
    res.send()
    db.release()
})

server.register(fastify_static, {
    root: path.join(__dirname, '../client/build')
})

server.get('/:any', async (req, res) => {
    let file = await readfile(path.join(__dirname, '../client/build/index.html'))
    res.type('text/html').send(file)
})

let start = async () => {
    let p = await server.listen(process.env.PORT ?? 5000, '0.0.0.0')
    console.log('Server up and running on address ' + p)
}

start()