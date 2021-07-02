import React, { FC, useEffect, useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import cancelIcon from './cancel.svg'
import Autocomplete from './Autocomplete'
import { nameArray } from './names'

let format = Intl.DateTimeFormat('it', { day: '2-digit', month: '2-digit', year: 'numeric' }).format

let percs: Map<number, number> = new Map()

let caps = (str: string) => {
    let ss = str.split(' ')
    return ss.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
}

let App: FC = props => {
    let [targetDate, setTargetDate] = useState<number>()
    let [dates, setDates] = useState<number[]>([])
    let [selected, setSelected] = useState(0)
    let [bdisabled, disableButton] = useState(false)
    let [error, setError] = useState('')
    let [success, setSuccess] = useState(false)

    let [partecipations, setPartecipations] = useState<[number, number][][]>()
    let [people, setPeople] = useState<string[]>()

    useEffect(() => {
        fetch('/getall').then(async res => {
            let partRows: [string, string][][] = await res.json()
            let newparts: typeof partecipations = partRows.map(r => r.map(p => [
                new Date(p[0]).getTime(),
                new Date(p[1]).getTime()
            ]))
            setPartecipations(newparts)
        })
        fetch('/people').then(async res => {
            let ppl: string[] = await res.json()
            setPeople(ppl.map(n => caps(n)))
        })
    }, [])

    let ranges: number[][] = []
    dates.forEach((d, i) => {
        if (i % 2 === 0) ranges.push([d])
        else ranges[Math.floor(i / 2)].push(d)
    })
    if (ranges[ranges.length - 1]?.length !== 1) ranges.push([])

    let getPartecipationPercentage = (t: number) => {
        if (!partecipations) return undefined
        let perc = 0
        partecipations?.forEach(row => {
            for (let period of row)
                if (t >= period[0] && t <= period[1]) {
                    perc += 1 / partecipations!.length
                    break
                }
        })
        percs.set(t, perc)
        return perc
    }

    return success
        ? <div className="success">
            <h1>{'Grazie ' + caps((document.querySelector('input[type=text]') as HTMLInputElement).value.split(' ')[0]) + ', la tua preferenza è stata registrata'}</h1>
            <h2>Puoi aggiornarla in qualsiasi momento tornando a questa pagina</h2>
        </div>
        : <div className="App">
            <h1 className="title">Cena di classe ex 5ASA 19/20</h1>
            <div className="people">
                {people?.length ?? 0} persone hanno già espresso la loro preferenza
                <div className="people_tooltip">
                    {people?.map(p => <p key={"toolttt" + p}>{p}</p>)}
                </div>
            </div>
            {error ? <p className="error">{error}</p> : undefined}
            <div className="input">
                <label htmlFor="name">nome</label>
                <Autocomplete suggestions={nameArray.map(n => caps(n))} />
            </div>
            <h3>Seleziona le date in cui saresti disponibile</h3>
            <div className="calendar_container">
                <Calendar
                    minDetail="month"
                    minDate={new Date('2021-07-21T00:00:00')}
                    maxDate={new Date('2021-09-30T00:00:00')}
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
                        let t = date.getTime()
                        let perc = percs.get(t) ?? getPartecipationPercentage(t) ?? 0

                        return <div
                            className="tile_container"
                            style={{
                                backgroundColor: `hsl(190, 95%, ${100 - perc * 40}%)`
                            }}
                        // onMouseEnter={() => {
                        //     if (dates.length % 2 && t > dates[dates.length - 1]) {
                        //         setTargetDate(t)
                        //     }
                        // }}
                        >
                            <div className="tile">
                                <div className="tile_tooltip">
                                    {Math.floor(perc * 100) + '%'}
                                </div>
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
                                    setSelected(dates.length)
                                    setTargetDate(undefined)
                                }}
                            >
                                <img src={cancelIcon} alt="cancel" width="14" height="14" />
                            </div>
                        </div>
                    })}
                </div>
            </div>
            <div className="gradient"></div>
            <button
                disabled={bdisabled}
                className="submit_button"
                onClick={async () => {
                    setError('')
                    let nameInput = document.querySelector('input[type=text]') as HTMLInputElement
                    let name = nameInput.value.toLowerCase()
                    if (!nameArray.includes(name)) {
                        setError('Seleziona il tuo nome completo dalla lista')
                        return
                    }

                    let ds = ranges.map(r => r.map(d => new Date(d).toISOString()))
                    ds.splice(ds.length - 1)
                    if (ds.length < 1) {
                        setError('Devi selezionare una data, duh')
                        return
                    }
                    disableButton(true)

                    let res = await fetch('/dates', {
                        method: 'post',
                        headers: { 'Content-type': 'application/json' },
                        body: JSON.stringify({
                            name,
                            dates: ds
                        })
                    })

                    if (res.status === 200) setSuccess(true)
                    else {
                        setError('risposta ' + res.status + '. di a tommaso che è un coglione')
                        disableButton(false)
                    }
                }}
            >
                conferma
            </button>
        </div >
}

export default App