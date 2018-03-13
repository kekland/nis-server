let requester = require('../requester')
let globalData = require('../data');
let unirest = require('unirest')
let account = require('../login/account')

function getAllSubjects(user) {

	let promiseChain = []

	for (let quarter = 1; quarter <= 4; quarter++) {
		promiseChain.push(getSubjects(user, { quarter: quarter }))
	}
	return Promise.all(promiseChain)
}
function getSubjects(user, data) {
	return new Promise((resolve, reject) => {
		let requestData = {
			periodId: data.quarter
		};

		if (user.studentID) {
			requestData.studentId = user.studentID;
		}

		requester.request({ url: globalData.schoolConvert[user.schoolID] + '/ImkoDiary/Subjects', requestParams: requestData, jar: user.jar })
			.then(result => {
				let subjects = []

				for (let item of result.response.data) {
					subjects.push({
						id: item.Id,
						name: item.Name,
						formative: {
							current: item.ApproveCnt,
							maximum: item.Cnt
						},
						summative: {
							current: item.ApproveISA,
							maximum: item.MaxISA
						},
						grade: item.Period,
						lastChanged: item.LastChanged
					})
				}

				resolve({ quarter: data.quarter, data: subjects })
			})
			.catch(err => {
				if (data.retry) {
					reject(err)
				}
				else {
					data.retry = true
					account.fullLogin(user)
						.then((result) => {
							user = result
							return getSubjects(user, data)
						})
						.then(result => resolve(result))
						.catch(err => reject(err))
				}
			})
	})
}

module.exports.getSubjects = getSubjects
module.exports.getAllSubjects = getAllSubjects