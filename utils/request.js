const define = require('define.js')
const util = require('util.js')

/**
 * 서버와의 데이터 통신을 위한 메서드
 *
 * @param {API 호출 URL} url
 * @param {전송파라메터} data
 * @param {API호출방식} method
 * @param {테스트방식} isTest(true: 테스트, false: 테스트아님)
 */
function request(url, data = {}, method = 'GET', kind = '') {
    return new Promise((resolve) => {
        wx.request({
            url: kind === 'pay' ? define.AUTH_URL + url : define.SERVER_URL + url,
            method: method,
            data: data,
            header: {
                'Content-Type': 'application/json',
                token: wx.getStorageSync('token'),
                'access-id': wx.getStorageSync('visit_id')
            },
            success: (res) => {
                let message = ''
                let ret = {
                    data: res.data.data,
                    action: true,
                    code: res.data.code,
                    msg: res.data.msg
                }

                switch (res.statusCode) {
                    case 200:
                    case 201:
                    case 204:
                        resolve(ret)
                        break
                    case 403: // permission denied
                        resolve({ action: false })
                        wx.reLaunch({
                            url: '/pages/exception/warning/warning?reason=' + res.data.msg
                        })
                        break
                    case 500:
                        message = '操作失败，错误编号：10002'

                        if (res.data.msg) {
                            message = res.data.msg
                        } else if (res.data.message !== '') {
                            message = res.data.message
                        }

                        util.showToast(message, 'none', '', 4000, true)
                        ret.action = false
                        resolve(ret)
                        break
                    case 400:
                        message = '操作失败，错误编号：10003'

                        if (res.data.msg) {
                            message = res.data.msg
                        } else if (res.data.message !== '') {
                            message = res.data.message
                        }

                        if (url !== 'orders/delivery' && method !== 'POST') {
                            util.showToast(message, 'none', '', 3000, true)
                        }

                        ret.action = false
                        resolve(ret)
                        break
                    case 503:
                    case 501:
                        resolve({ action: false })
                        wx.reLaunch({
                            url: '/pages/exception/inspect/inspect?reason=' + res.data.msg
                        })
                        break
                    case 401: // auth fail
                        // 인증 실패이면 이전의 토큰값을 초기화 하고 메인페지로 리다이렉트
                        wx.removeStorageSync('token')
                        util.showToast(res.data.msg, 'none', '', 3000, true)
                        ret.action = false
                        resolve(ret)

                        setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/main/main'
                            })
                        }, 2000)
                        break
                    case 404:
                        resolve({ action: false })
                        wx.reLaunch({
                            url: '/pages/exception/404/404?reason=' + res.data.msg
                        })
                        break
                    case 405:
                        message = '找不到'

                        if (res.data.msg) {
                            message = res.data.msg
                        } else if (res.data.message !== '') {
                            message = res.data.message
                        }

                        util.showToast(message, 'none', '', 3000, true)
                        ret.action = false
                        resolve(ret)
                        break
                }
            },
            fail: (err) => {
                // util.showToast('网络异常', 'error', '', 2000, true)
                resolve({ action: false })
            }
        })
    })
}

/**
 * 서버와의 파일업로드를 위한 메서드
 *
 * @param {API 호출 URL} url
 * @param {전송파라메터} data
 * @param {API호출방식} method
 */
function requestFileUpload(url, data = {}, method = 'GET') {
    return new Promise((resolve) => {
        wx.request({
            url: define.SERVER_URL + url,
            method: method,
            data: data.buffer,
            header: {
                'Content-Type': data.contentType,
                token: wx.getStorageSync('token')
            },
            success: (res) => {
                let ret = {
                    data: res.data.data,
                    action: true,
                    code: res.data.code
                }

                switch (res.statusCode) {
                    case 200:
                    case 201:
                    case 204:
                        resolve(ret)
                        break
                    case 403: // permission denied
                        resolve({ action: false })
                        wx.navigateTo({
                            url: '/pages/exception/warning/warning?reason=' + res.data.msg
                        })
                        break
                    case 503:
                        resolve({ action: false })
                        wx.navigateTo({
                            url: '/pages/exception/inspect/inspect?reason=' + res.data.msg
                        })
                        break
                    case 401: // auth fail
                        // 인증 실패이면 이전의 토큰값을 초기화 하고 메인페지로 리다이렉트
                        wx.removeStorageSync('token')
                        util.showToast(res.data.msg, 'none', '', 3000, true)
                        ret.action = false
                        resolve(ret)

                        setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/main/main'
                            })
                        }, 2000)
                        break
                    case 400:
                    case 404:
                    case 405:
                        let errValue = '找不到'

                        if (res.data.msg) {
                            errValue = res.data.msg
                        } else if (res.data.message !== '') {
                            errValue = res.data.message
                        }

                        util.showToast(errValue, 'none', '', 3000, true)
                        ret.action = false
                        resolve(ret)
                        break
                    case 500:
                        util.showToast('网络异常', 'none', '', 3000, true)
                        resolve({ action: false })
                        break
                }
            },
            fail: (err) => {
                // util.showToast('网络异常', 'error', '', 2000, true)
                resolve({ action: false })
            }
        })
    })
}

module.exports = {
    request,
    requestFileUpload
}
