import React, { useState, useEffect } from 'react'
import personService from './services/persons'

const PersonForm = ({onSubmitHandler, inputs}) => (
    <form onSubmit={onSubmitHandler}>
        {inputs.map(i => <Input key={i.label} label={i.label} value={i.value} onChange={i.onChange}/> )}
        <div><button type="submit">add</button></div>
    </form>
)

const Input = ({label, value, onChange}) => (
    <div>{label}:{" "}
        <input value={value} onChange={onChange}/>
    </div>
)

const Persons = ({persons}) =>
    persons.map(p => <Person key={p.name} name={p.name} number={p.number}/>)

const Person = ({name, number}) => <p>{name} {number}</p>

const App = () => {
    const [persons, setPersons] = useState([])
    const [filtered, setFiltered] = useState(persons)
    const [newName, setNewName] = useState('')
    const [newNumber, setNewNumber] = useState('')
    const [currentFilter, setCurrentFilter] = useState('')
    const setValueWith = (setter) => e => setter(e.target.value)

    const fetchPersons = () => void personService.getAll()
        .then(pers => (setPersons(pers), setFiltered([...pers])))
    useEffect(fetchPersons, [])

    const addPerson = e => {
        e.preventDefault()
        if (persons.map(p => p.name).includes(newName))
            alert(`${newName} is already added to phonebook`)
        else {
            const newPerson = {name: newName, number: newNumber}
            personService.create(newPerson).then(returnedPerson => {
                const updatedPersons = persons.concat(returnedPerson)
                setPersons(updatedPersons)
                setNewName('')
                changeFilter(currentFilter, [...updatedPersons])
                setNewNumber('')
            })
        }
    }

    const handleFilterChange = e => changeFilter(e.target.value)
    const changeFilter = (value, pers = persons) => {
        setCurrentFilter(value)
        if (value === '') setFiltered([...pers])
        else setFiltered(pers.filter(p => p.name.match(new RegExp(value, 'i'))))
    } 

    return (
        <div>
            <h2>Phonebook</h2>
                <Input label={'filter'} value={currentFilter} onChange={handleFilterChange}/>
            <h2>Add a new</h2>
            <PersonForm onSubmitHandler={addPerson} inputs={[
                {label: 'name', value: newName, onChange: setValueWith(setNewName)},
                {label: 'number', value: newNumber, onChange: setValueWith(setNewNumber)}
            ]}/>
            <h2>Numbers</h2>
            <Persons persons={filtered}/>
        </div>
    )

}

export default App