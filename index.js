require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

// Used to log HTTP requests to the console
app.use(morgan((tokens, req, res) => {
    const method = tokens.method(req, res)
    
    if (method === 'POST') {
        const body = JSON.stringify(req.body)

        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            body
        ].join(' ')
    }
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ')
}))

let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-33-532532",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
    },
    {
        name: "Mary Poppendieck",
        number: "39-23-642122",
        id: 4
    }
]

// Home page
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

// Get persons API 
app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => response.json(persons.map(person => person.toJSON())))
})

// Get information on the phonebook length
app.get('/info', (request, response) => {
    const phonebookLength = persons.length
    const date = new Date()
    response.send(`<p>Phonebook has info for ${phonebookLength} people.</p> <p> ${date} </p>`)
})

// Get API for each person
app.get('/persons/:id', (request, response) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
    })
    .catch((error) => {
        console.log(error)
        response.status(404).send({ error: 'malformmated id '})
    })
})

// Delete a person
app.delete('/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

// Add new person
app.post('/api/persons', (request, response) => {
    const body = request.body

    if (body.name === undefined || body.number === undefined) {
        return response.status(400).json({
            error: 'content missing'
        })
    }
    else if (nameAlreadyExists(body.name)) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson.toJSON())
    })
})

// If name is alreadyin phonebook
const nameAlreadyExists = (name) => {
    const personList = persons.map(p => p.name)
    
    if (personList.indexOf(name) !== -1) {
        return true
    }
    else {
        return false
    }
}

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})