let requester = require('../requester')
let globalData = require('../data');
let unirest = require('unirest')
function login(data) {
	return new Promise((resolve, reject) => {
		if (!data.pin || !data.password || !data.schoolID || !globalData.schoolConvert[data.schoolID]) {
			reject({ message: 'Check query parameters' })
		}
		else {
			let jar = unirest.jar()
			let locale = 'en-US'
			if (data.locale) { locale = data.locale }

			jar.add('Culture=' + locale, globalData.schoolConvert[data.schoolID])
			jar.add('lang=' + locale, globalData.schoolConvert[data.schoolID])

			let requestData = { txtUsername: data.pin, txtPassword: data.password };
			requester
				.request({ url: globalData.schoolConvert[data.schoolID] + '/Account/Login', requestParams: requestData, jar: jar })
				.then(result => {
					resolve({ jar: result.jar })
				})
				.catch(err => {
					reject(err)
				})
		}
	})
}

function getRoles(data) {
	return new Promise((resolve, reject) => {
		requester
			.request({ url: globalData.schoolConvert[data.schoolID] + '/Account/GetRoles', requestParams: {}, jar: data.jar })
			.then(result => {
				//Preferable roles: Student > Parent > Teacher
				let selectedRole
				for (let role of result.response.listRole) {
					if (role.value === 'Student') {
						selectedRole = role;
						break;
					}
					else if (role.value === 'Parent') {
						selectedRole = role;
						break;
					}
				}
				if (selectedRole !== undefined) {
					resolve({ role: selectedRole, roles: result.response.listRole })
				}
				else {
					reject({ message: 'No suitable role found' })
				}
			})
			.catch(err => {
				reject(err)
			})
	})
}

function loginWithRole(data) {
	return new Promise((resolve, reject) => {
		let requestData = { role: data.role, password: data.password };

		requester
			.request({ url: globalData.schoolConvert[data.schoolID] + '/Account/LoginWithRole', requestParams: requestData, jar: data.jar })
			.then(result => {
				resolve({ jar: result.jar })
			})
			.catch(err => {
				reject(err)
			})
	})
}

function fullLogin(user) {
	return new Promise((resolve, reject) => {
		login(user)
			.then(result => {
				user.jar = result.jar
				console.log('login success')
				return getRoles(user)
			})
			.then(result => {
				console.log('getRoles success')
				user.role = result.role.value
				return loginWithRole(user)
			})
			.then(result => {
				console.log('loginWithRole success')
				user.jar = result.jar
				resolve(user)
			})
			.catch(err => {
				console.log(JSON.stringify(err))
				reject(err)
			})
	})
}

module.exports.login = login
module.exports.getRoles = getRoles
module.exports.loginWithRole = loginWithRole
module.exports.fullLogin = fullLogin