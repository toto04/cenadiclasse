import React, { FC, useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import cancelIcon from './cancel.svg'

let format = Intl.DateTimeFormat('it', { day: '2-digit', month: '2-digit', year: 'numeric' }).format
let nameInput: HTMLInputElement

let App: FC = props => {
    let [targetDate, setTargetDate] = useState<number>()
    let [dates, setDates] = useState<number[]>([])
    let [selected, setSelected] = useState(0)

    let ranges: number[][] = []
    dates.forEach((d, i) => {
        if (i % 2 === 0) ranges.push([d])
        else ranges[Math.floor(i / 2)].push(d)
    })
    if (ranges[ranges.length - 1]?.length !== 1) ranges.push([])

    return <div className="App">
        <h1>Cena di classe ex 5ASA 19/20</h1>
        <div className="input">
            <label htmlFor="name">nome e cognome</label>
            <input ref={r => { if (r) nameInput = r }} type="text" id="name" />
        </div>
        <Calendar
            onChange={d => {
                let t = d.getTime()

                for (let [i, date] of dates.entries()) {
                    if (t === date && (i % 2 || dates[i + 1] !== undefined)) {
                        setSelected(dates.indexOf(date))
                        return
                    }
                }
                if (t < dates[selected - 1]) {
                    let x = 1
                    while (t < dates[selected - (x + 1)]) x++
                    dates[selected - x] = t
                    setDates([...dates])
                    setSelected(dates.length)
                } else if (t > dates[selected + 1]) {
                    let x = 1
                    while (t > dates[selected + (x + 1)]) x++
                    dates[selected + x] = t
                    setDates([...dates])
                    setSelected(dates.length)
                } else {
                    dates[selected] = t
                    setDates([...dates])
                    setSelected(dates.length)
                }

                setTargetDate(undefined)
            }}
            value={dates[selected] ? new Date(dates[selected]) : undefined}
            tileContent={({ date, view }) => {
                if (view !== 'month') return null
                return <div
                    className="tile_container"
                    onMouseEnter={() => {
                        if (dates.length % 2) setTargetDate(date.getTime())
                    }}
                >
                    <div className="tile">
                        {date.getDate()}
                    </div>
                </div>
            }}
            tileClassName={({ date }) => {
                let t = date.getTime()

                let list: string[] = []
                dates.forEach((d, i) => {
                    if (t === d) {
                        list.push(i % 2 ? 'range_end' : 'range_start')
                    }
                    if (i % 2 === 0 && t > d && t < dates[i + 1]) list.push('range')
                })
                if (targetDate) {
                    if (t === targetDate) list.push('range_end')
                    if (t < targetDate && t > dates[dates.length - 1]) list.push('range')
                }
                return list
            }}
        />
        <div className="range_display">
            {ranges.map((r, i) => {
                let fromSelected = selected / 2 === i
                let toSelected = (selected - 1) / 2 === i
                return <div key={'range' + i} className="range">
                    <div
                        className={"date" + (fromSelected ? ' selected' : '')}
                        onClick={() => setSelected(i * 2)}
                    >
                        <span>da</span>
                        {r[0] ? format(new Date(r[0])) : "--/--/----"}
                    </div>
                    <div
                        className={"date" + (toSelected ? ' selected' : '')}
                        onClick={() => r[0] ? setSelected(i * 2 + 1) : null}
                    >
                        <span>a</span>
                        {r[1] ? format(new Date(r[1])) : "--/--/----"}
                    </div>
                    <div
                        className="cancel"
                        onClick={() => {
                            dates.splice(i * 2, r[1] ? 2 : 1)
                            setDates([...dates])
                            setTargetDate(undefined)
                        }}
                    >
                        <img src={cancelIcon} alt="cancel" width="14" height="14" />
                    </div>
                </div>
            })}
        </div>
        <button onClick={async () => {
            let ds = ranges.map(r => r.map(d => new Date(d).toISOString()))
            ds.splice(ds.length - 1)
            let res = await fetch('/dates', {
                method: 'post',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({
                    name: nameInput.value,
                    dates: ds
                })
            })
        }}>
            conferma
        </button>
    </div >
}

export default App