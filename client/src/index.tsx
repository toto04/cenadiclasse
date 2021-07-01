import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './style.scss'

ReactDOM.render(
    <React.StrictMode>
        <App />
        <footer>
            <p>questa web app è stata sviluppata in molto poco tempo da Tommaso Morganti</p>
            <p>se si rompe qualcosa abbiate pazienza, sono in sessione e non ho tempo :(</p>
            <p>mandatemi un messaggino e fixo subito promesso, elia culo</p>
            <p><a href="https://youtu.be/dQw4w9WgXcQ">Privacy policy</a> • <a href="https://youtu.be/6n3pFFPSlW4">Politica sui cookie</a></p>
        </footer>
    </React.StrictMode>,
    document.getElementById("root")
)