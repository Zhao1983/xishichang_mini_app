// pages/mypage/myinfo/auth_number/auth_number.js
const api = require('../../../../utils/request.js')
const util = require('../../../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '绑定手机号', // 네비게이션 타이틀
        phone: '', // 인증폰번호
        interval: 0,
        second: 60,
        authKey: [], // 입력되는 인증코드
        index: 0,
        authCode: '', // 서버에서 내려오는 인증코드
        isFocusFirst: false,
        isFocusSecond: false,
        isFocusThird: false,
        isFocusFourth: false
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()
        this.setData({
            phone: options.phone,
            interval: setInterval(this.countTime, 1000)
        })

        this.getAuthCode()
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {},

    /**
     * Lifecycle function--Called when page hide
     */
    onHide: function () {},

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {},

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {},

    /**
     * Called when page reach bottom
     */
    onReachBottom: function () {},

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {},
    // 인증코드 받기
    getAuthCode: function () {
        this.setData({
            pageLoading: true
        })
        api.request(`smsAuth?phoneNum=${this.data.phone}`, {}, 'POST').then((resppose) => {
            if (resppose.action) {
                if (resppose.data !== null) {
                    this.setData({
                        pageLoading: false,
                        authCode: resppose.data.value
                    })
                } else {
                    this.setData({
                        pageLoading: false
                    })
                }
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    setInputValue: function (e) {
        switch (e.currentTarget.dataset.index) {
            case '0':
                if (e.detail.keyCode === 8) {
                    this.data.authKey.splice(parseInt(e.currentTarget.dataset.index), 1)
                    this.setData({
                        authKey: this.data.authKey
                    })
                } else {
                    this.data.authKey[parseInt(e.currentTarget.dataset.index)] = e.detail.value
                    this.setData({
                        isFocusSecond: true,
                        authKey: this.data.authKey
                    })
                }
                break
            case '1':
                if (e.detail.keyCode === 8) {
                    this.data.authKey.splice(parseInt(e.currentTarget.dataset.index), 1)
                    this.setData({
                        isFocusFirst: true,
                        authKey: this.data.authKey
                    })
                } else {
                    this.data.authKey[parseInt(e.currentTarget.dataset.index)] = e.detail.value
                    this.setData({
                        isFocusThird: true,
                        authKey: this.data.authKey
                    })
                }
                break
            case '2':
                if (e.detail.keyCode === 8) {
                    this.data.authKey.splice(parseInt(e.currentTarget.dataset.index), 1)
                    this.setData({
                        isFocusSecond: true,
                        authKey: this.data.authKey
                    })
                } else {
                    this.data.authKey[parseInt(e.currentTarget.dataset.index)] = e.detail.value
                    this.setData({
                        isFocusFourth: true,
                        authKey: this.data.authKey
                    })
                }
                break
            case '3':
                if (e.detail.keyCode === 8) {
                    this.data.authKey.splice(parseInt(e.currentTarget.dataset.index), 1)
                    this.setData({
                        isFocusThird: true,
                        authKey: this.data.authKey
                    })
                } else {
                    this.data.authKey[parseInt(e.currentTarget.dataset.index)] = e.detail.value
                    this.setData({
                        authKey: this.data.authKey
                    })
                }
                break
        }

        if (this.data.authKey.length === 4) {
            let code = ''

            this.data.authKey.filter((res) => {
                code += res
            })

            if (code === this.data.authCode) {
                wx.navigateBack({
                    delta: -1
                })
                this.setData({
                    pageLoading: true
                })

                api.request(`smsAuth?phoneNum=${this.data.phone}&authCode=${this.data.authCode}`, {}, 'PUT').then((resppose) => {
                    if (resppose.action) {
                        if (resppose.data !== null) {
                            this.setData({
                                pageLoading: false
                            })

                            wx.navigateBack({
                                delta: 1
                            })
                        } else {
                            this.setData({
                                pageLoading: false
                            })
                        }
                    } else {
                        this.setData({
                            pageLoading: false
                        })
                    }
                })
            }
        }
    },
    countTime: function () {
        this.setData({
            second: --this.data.second
        })

        if (this.data.second <= 0) {
            clearInterval(this.data.interval)
            this.setData({
                authCode: '',
                authKey: [],
                second: 60
            })

            return
        }
    }
})
