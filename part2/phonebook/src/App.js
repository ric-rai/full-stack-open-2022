import React, { useState, useEffect } from 'react'
import personService from './services/persons'

const PersonForm = ({onSubmitHandler, inputs}) => (
    <form onSubmit={onSubmitHandler}>
        {inputs.map(i => <Input {...i} key={i.label}/> )}
        <div><button type="submit">add</button></div>
    </form>
)
const Input = props => <div>{props.label}:{" "} <input {...props}/></div>
const Persons = ({persons, handleDelete}) => persons.map(p => 
    <Person {...p} key={p.name} handleDelete={handleDelete}/>)
const Person = ({name, number, handleDelete}) => 
    <div>{name} {number} <Button text={"delete"} handleClick={handleDelete(name)}/></div> 
const Button = ({text, handleClick}) => <button onClick={handleClick}>{text}</button>
const Notification = ({msg, color}) => msg === undefined 
    ? null : <div className='notification' style={{'color': color}}>{msg}</div>

const App = () => {
    const [persons, setPersons] = useState([])
    const [filtered, setFiltered] = useState(persons)
    const [filter, setFilter] = useState('')
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [msgObj, setMsgObj] = useState(null)
    const changeInputValue = (setter) => e => setter(e.target.value)
    const getPerIdByName = name => persons.find(p => p.name === name)?.id
    const setPersonStates = pers => (setPersons(pers), changeFilter(filter, [...pers])) 
    useEffect(() => void personService.getAll().then(setPersonStates), [])

    const addPerson = e => {
        e.preventDefault()
        const p = {name: newName, number: newNumber, id: getPerIdByName(newName)}
        const setPerStatesResetForm = pers => (setPersonStates(pers), setNewName(''), setNewNumber(''))
        const getUpdPersons = newP => persons.map(p => p.id !== newP.id ? p : newP)
        const isUpdMsg = p => `${p.name} is already added to phonebook, replace the old number with a new one?`
        const notify = (msg, color) => (setMsgObj({msg, color}), setTimeout(() => setMsgObj(null), 3000))
        const updPerson = p => (setPerStatesResetForm(getUpdPersons(p)), notify(`Updated ${p.name}`))
        const addPerson = p => (setPerStatesResetForm(persons.concat(p)), notify(`Added ${p.name}`))
        if (p.id === undefined) personService.create(p).then(addPerson) 
        else if (window.confirm(isUpdMsg(p))) personService.update(p).then(updPerson)
            .catch(() => notify(`Information of ${p.name} has already been removed from the server`, 'red'))
    }
    const handleDelete = name => () => (
        window.confirm(`Delete ${name}?`) ? personService.del(getPerIdByName(name))
            .then(() => setPersonStates(persons.filter(p => p.name !== name))) : undefined 
    )
    const changeFilter = (value, pers = persons) => (
        setFilter(value), setFiltered(value === '' 
            ? [...pers] : pers.filter(p => p.name.match(new RegExp(value, 'i'))) )
    ) 
    return (
        <div>
            <h2>Phonebook</h2>
                <Input label={'filter'} value={filter} onChange={e => changeFilter(e.target.value)}/>
            <Notification {...msgObj}/>
            <h2>Add a new</h2>
            <PersonForm onSubmitHandler={addPerson} inputs={[
                {label: 'name', value: newName, onChange: changeInputValue(setNewName)},
                {label: 'number', value: newNumber, onChange: changeInputValue(setNewNumber)}
            ]}/>
            <h2>Numbers</h2>
            <Persons persons={filtered} handleDelete={handleDelete}/>
        </div>
    )
}

export default App