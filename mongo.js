const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as an argument')
    process.exit(1)
}

// Get the password to plug into the url without showing the password to the world
const password = process.argv[2]

// Connect to the database
const url = 
    `mongodb+srv://fullstack:${password}@cluster0-3lf82.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true })

// Declaring Schema for a person
const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
    console.log('phonebook: ')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${ person.name } ${ person.number }`)
            mongoose.connection.close()
        })
    })
}

// If user inputs 5 arguments "node mongo.js password name number", add to the DB
if (process.argv.length === 5) {
    const newName = process.argv[3]
    const newNumber = process.argv[4]

    const person = new Person({
        name: newName,
        number: newNumber,
    })

    person.save().then(result => {
        console.log(`added ${ newName } ${ newNumber } to the phonebook`)
        mongoose.connection.close()
    })
}


