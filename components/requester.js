let unirest = require('unirest')

function request(data) {
	return new Promise((resolve, reject) => {
		let url = data.url
		let requestParams = data.requestParams
		let jar = data.jar

		unirest.post(url)
			.send(requestParams)
			.jar(jar)
			.encoding('utf-8')

			.end(result => {
				if (result.statusType == 2) {
					var response = result.body
					if (response.success === true) {
						resolve({ response: response, jar: jar })
					}
					else {
						reject({message: response.ErrorMessage})
					}
				}
				else {
					reject({
						message: 'No connection to server'
					})
				}
			})
	})
}

function requestWithReferer(data, callback) {
	let url = data.url
	let requestParams = data.requestParams
	let jar = data.jar
	let referer = data.referer

	unirest.post(url)
		.send(requestParams)
		.header('Referer', referer)
		.jar(jar)
		.encoding('utf-8')
		.end(result => {
			if (result.statusType == 2) {
				var response = result.body
				callback(null, { success: true, response: response, jar: jar })
			}
			else {
				callback({
					success: false,
					message: 'No connection to server',
					errorCode: '1'
				}, null)
			}
		})
}

module.exports.request = request
module.exports.requestWithReferer = requestWithReferer