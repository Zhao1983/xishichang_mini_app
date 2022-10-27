const app = getApp()
const util = require('util.js')
const api = require('request.js')
const define = require('define.js')

/**
 * 위챗 로그인 상태값 확인
 */
function isCheckSession() {
    return new Promise((resolve, reject) => {
        wx.checkSession({
            success: function () {
                resolve(true)
            },
            fail: function () {
                reject(false)
            }
        })
    })
}

/**
 * 사용자의 위챗프로필정보 얻기
 */
function getUserProfile() {
    return new Promise((resolve) => {
        if (wx.getUserProfile) {
            wx.getUserProfile({
                desc: '用于完善会员资料',
                lang: 'zh_CN',
                success: (resp) => {
                    resolve(resp.userInfo)
                },
                fail: (err) => {
                    resolve({})
                }
            })
        } else {
            resolve({})
        }
    })
}

/**
 * 위챗에 의한 로그인
 *
 */
function isLoginByWeiXin(userinfo) {
    return new Promise((resolve) => {
        // 위챗 사용자 코드 얻기
        wx.login({
            success: function (res) {
                if (res.code) {
                    if (userinfo.avatarUrl) {
                        wx.request({
                            url: define.AUTH_URL + 'mini/login?code=' + res.code + '&avatar=' + userinfo.avatarUrl + '&nick=' + userinfo.nickName.replace(/[`^]/gi, '') + '&gender=' + userinfo.gender,
                            method: 'POST',
                            header: {
                                'Content-Type': 'application/json'
                            },
                            success: (response) => {
                                if (response.statusCode === 200) {
                                    if (response.data.token !== null && response.data.token !== '') {
                                        wx.setStorageSync('token', response.data.token)

                                        // 로그인 성공이면 장바구니 개수 얻기
                                        api.request('carts/num').then((response) => {
                                            wx.setStorageSync('cart_count', response.data)
                                            resolve(true)
                                            util.showToast('登录成功', 'success', '', 2000, true)
                                        })
                                    } else {
                                        util.showToast('登录失败', 'error', '', 2000, true)
                                        resolve(false)
                                    }
                                } else {
                                    util.showToast('登录失败', 'error', '', 2000, true)
                                    resolve(false)
                                }
                            },
                            fail: (err) => {
                                util.showToast('登录失败', 'error', '', 2000, true)
                                resolve(false)
                            }
                        })
                    } else {
                        util.showToast('登录失败', 'error', '', 2000, true)
                        resolve(false)
                    }
                } else {
                    util.showToast('登录失败', 'error', '', 2000, true)
                    resolve(false)
                }
            },
            fail: (err) => {
                util.showToast('登录失败', 'error', '', 2000, true)
                resolve(false)
            }
        })
    })
}

module.exports = {
    isCheckSession,
    isLoginByWeiXin,
    getUserProfile
}
