import React, { FC, useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
// import Autocomplete from './Autocomplete'
// import { nameArray } from './names'

let Secret: FC = props => {
    let [dates, setDates] = useState<number[]>()
    let [prefs, setPrefs] = useState<{ [name: string]: [number, number][] }>()

    useEffect(() => {
        fetch('/supersecret').then(async res => {
            let rows: { [name: string]: [string, string][] } = await res.json()
            let a: typeof prefs = {}
            for (let name in rows) {
                a[name] = rows[name].map(r => [
                    new Date(r[0]).getTime(),
                    new Date(r[1]).getTime()
                ])
            }
            setPrefs(a)
            let n = Object.keys(a)[0]
            let ds: number[] = []
            a[n].forEach(l => ds.push(...l))
            setDates(ds)
        })
    }, [])

    let getPartecipationPercentage = (t: number) => {
        if (!prefs) return 0
        let perc = 0
        Object.keys(prefs).forEach(name => {
            for (let d of prefs![name])
                if (t >= d[0] && t <= d[1]) {
                    perc += 1 / Object.keys(prefs!).length
                    break
                }
        })
        return perc
    }

    let getPartecipationNamelist = (t: number) => {
        if (!prefs) return []
        let namelist: string[] = [`${Math.round(Object.keys(prefs).length * getPartecipationPercentage(t))} persone:`]
        Object.keys(prefs).forEach(name => {
            for (let d of prefs![name])
                if (t >= d[0] && t <= d[1]) {
                    namelist.push(name)
                    break
                }
        })
        return namelist
    }

    return <div className="App" style={{ alignItems: 'center' }}>
        <h1>Questa pagina è super segreta</h1>
        <h2>{"non dovresti essere qui, clicca sulla privacy policy in fondo alla pagina >:C"}</h2>
        <select
            onChange={e => {
                if (!prefs) return
                let n = e.currentTarget.value
                console.log(n)
                let ds: number[] = []
                prefs[n].forEach(l => ds.push(...l))
                setDates(ds)
            }}
        >
            {prefs ? Object.keys(prefs).map(name => {
                return <option key={"asdOption" + name} value={name}>
                    {name}
                </option>
            }) : undefined}
        </select>
        <Calendar
            minDetail="month"
            value={new Date("2021-06-04T00:00:00")}
            minDate={new Date('2021-07-05T00:00:00')}
            maxDate={new Date('2021-07-26T00:00:00')}
            tileContent={({ date, view }) => {
                if (view !== 'month') return null
                let t = date.getTime()
                let perc = getPartecipationPercentage(t)

                return <div
                    className="tile_container"
                    style={{
                        backgroundColor: `hsl(190, 95%, ${100 - perc * 40}%)`
                    }}
                >
                    <div className="tile">
                        <div className="people_tooltip">
                            {getPartecipationNamelist(t).map(l => <p key={"ttaatt" + l}>{l}</p>)}
                        </div>
                        {date.getDate()}
                    </div>
                </div>
            }}
            tileClassName={({ date }) => {
                if (!dates) return null
                let t = date.getTime()

                let list: string[] = []
                dates.forEach((d, i) => {
                    if (t === d) {
                        list.push(i % 2 ? 'range_end' : 'range_start')
                    }
                    if (i % 2 === 0 && t > d && t < dates![i + 1]) list.push('range')
                })
                return list
            }}
        />
    </div>
}

export default Secret