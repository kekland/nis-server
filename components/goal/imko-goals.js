const requester = require('../requester')
let globalData = require('../data');
let unirest = require('unirest')
let account = require('../login/account')


function getGoals(user, data) {
	return new Promise((resolve, reject) => {
		let requestData = {
			periodId: data.quarter,
			subjectId: data.subjectID
		}

		if (user.studentID) {
			requestData.studentId = user.studentID
		}


		requester.request({
			url: globalData.schoolConvert[user.schoolID] + '/ImkoDiary/Goals',
			requestParams: requestData,
			jar: user.jar
		})
			.then(result => {
				let goals = result.response.data.goals
				let homework = result.response.data.homeworks

				let fixedGoals = []
				let fixedHomework = []

				let previousGroupIndex = '-1'

				for (let item of goals) {
					let groupIndex = item.GroupIndex
					if (groupIndex != previousGroupIndex) {
						previousGroupIndex = groupIndex
						fixedGoals.push({ index: groupIndex, text: item.GroupName, data: [] })
					}
					let value = item.Value
					let code
					if (value == 'Achieved' || value == 'Достиг' || value == 'Жетті') {
						code = '1'
					}
					else if (value == 'Working towards' || value == 'Стремится' || value == 'Тырысады') {
						code = '-1'
					}
					else {
						code = '0'
					}
					let date = item.Changed
					if (date != undefined && date.length > 0) {
						date = date.substring(8, 10) + '.' + date.substring(5, 7) + '.' + date.substring(0, 4)
					}
					let goal = {
						id: item.Id,
						name: item.Name,
						description: item.Description,
						status: value,
						statusCode: code,
						comment: item.Comment,
						changedDate: date
					}
					fixedGoals[fixedGoals.length - 1].data.push(goal)
				}

				for (let item of homework) {
					let hw = {
						description: item.description,
						date: item.date,
						files: []
					}
					for (let file in item.files) {
						hw.files.push({
							name: file.substring(file.indexOf('.')),
							url: file
						})
					}
					fixedHomework.push(hw)
				}

				resolve({ goals: fixedGoals, homework: fixedHomework })
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
							return getGoals(user, data)
						})
						.then(result => resolve(result))
						.catch(err => reject(err))
				}
			})
	})
}

module.exports.getGoals = getGoals