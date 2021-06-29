import React, { FC } from 'react'
// React deve sempre essere importato in qualsiasi file usi JSX

// FC è un functional component, ovvero una funzione che ritorna un elemento JSX
// i props sono passati come argomento alla funzione, il cui tipo può essere passato 
// come argomento al tipo FC (e.g FC<{ eliaculo: boolean }>)
let App: FC = props => {
    return <div className="App">
        <h1>React App</h1>
    </div>
}

export default App