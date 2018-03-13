const express = require('express')
const unirest = require('unirest')

const bodyParser = require('body-parser')
const cors = require('cors')

const cookieParser = require('cookie-parser')
const fs = require('fs')
const account = require('./components/login/account')
const imkoSubject = require('./components/subject/imko-subject')
const imkoGoals = require('./components/goal/imko-goals')

const app = express()
const port = process.env.PORT || 5000

app.set('port', port)

// Enable cross-domain sharing
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.use((request, response, next) => {
	//console.log(request.headers)
	next()
})

app.use((request, response, next) => {
	if (request.body) {
		console.log(request.body)
	}
	next()
})

app.post('/Login/', (request, response) => {
	account.fullLogin(request.body)
		.then((result) => {
			response.status(200).send(JSON.stringify(result))
		})
		.catch((err) => {
			response.status(400).send(JSON.stringify(err))
		})
})

app.post('/GetImkoSubjects/', (request, response) => {
	imkoSubject.getAllSubjects(request.body)
		.then(result => {
			response.status(200).send(JSON.stringify(result))
		})
		.catch(err => {
			response.status(400).send(JSON.stringify(err))
		})
})
app.post('/GetImkoSubjectOnQuarter/', (request, response) => {
	let data = {}
	if (request.body.quarter) {
		data.quarter = request.body.quarter
		request.body.quarter = undefined
	}
	else {
		response.status(400).send(JSON.stringify({ message: 'You have to specify quarter' }))
		return
	}
	imkoSubject.getSubjects(request.body, data)
		.then(result => {
			response.status(200).send(JSON.stringify(result))
		})
		.catch(err => {
			response.status(400).send(JSON.stringify(err))
		})
})

app.post('/GetImkoGoals/', (request, response) => {
	let data = {}
	if (request.body.quarter && request.body.subjectID) {
		data.quarter = request.body.quarter
		data.subjectID = request.body.subjectID
		request.body.quarter = undefined
		request.body.subjectID = undefined
	}
	else {
		response.status(400).send(JSON.stringify({ message: 'You have to specify Quarter and Subject ID\'s' }))
		return
	}

	imkoGoals.getGoals(request.body, data)
		.then(result => {
			response.status(200).send(JSON.stringify(result))
		})
		.catch(err => {
			response.status(400).send(JSON.stringify(err))
		})
})

app.use((err, request, response, next) => {
	// log the error, for now just console.log
	response.status(500).send(JSON.stringify({ success: false, message: 'Internal server error' }))
	console.log('Internal Server Error', err, true)
})

app.listen(port)

console.log('Server initialized')
