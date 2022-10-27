// pages/mypage/myinfo/auth_update/auth_update.js

const api = require('../../../../utils/request.js')
const util = require('../../../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '更换绑定手机号', // 네비게이션 타이틀
        phone: '', // 바운딩을 할 폰번호
        authCode: '', // 인증코드
        interval: 0, // 인증코드받는 대기시간계수값
        second: 60, // 인증코드받는 대기시간
        isSubmitCode: false, // 인증코드요청상태
        resAuthCode: '', // 전송받은 인증코드
        isShowToast: false, // 커스텀 토스트로출여부
        toastMessage: '' // 토스트메세지내용
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()
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
    // 문자렬 입력시 이벤트
    setInputValue: function (e) {
        if (e.currentTarget.dataset.kind === 'phone') {
            this.setData({
                phone: e.detail.value.replace(/[^0-9]/g, '').trim()
            })
        }

        if (e.currentTarget.dataset.kind === 'auth') {
            this.setData({
                authCode: e.detail.value.replace(/[^0-9]/g, '').trim()
            })
        }
    },
    // 폰번호에 의한 인증번호 요청
    setSendCode: function (e) {
        this.setData({
            pageLoading: true
        })

        api.request(`smsAuth?phoneNum=${this.data.phone}`, {}, 'POST').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        interval: setInterval(this.countTime, 1000),
                        isSubmitCode: true,
                        resAuthCode: response.data.value,
                        pageLoading: false
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
    // 인증번호받는 대기시간 계수
    countTime() {
        this.data.second--

        this.setData({
            second: this.data.second
        })

        if (this.data.second <= 0) {
            clearInterval(this.data.interval)
            this.setData({
                authCode: '',
                second: 60,
                isSubmitCode: false
            })

            return
        }
    },
    // 폰번호 프로필에 업데이트
    setUpdatePhoneInfo: function (e) {
        // 인증번호가 틀린 경우
        if (this.data.resAuthCode !== this.data.authCode) {
            this.setData({
                isShowToast: true,
                toastMessage: '验证失败'
            })

            return
        }

        this.setData({
            pageLoading: true
        })

        api.request(`smsAuth?phoneNum=${this.data.phone}&authCode=${this.data.authCode}`, {}, 'PUT').then((response) => {
            if (response.action) {
                clearInterval(this.data.interval)
                this.setData({
                    pageLoading: false,
                    isSubmitCode: false,
                    phone: '',
                    authCode: ''
                })
                wx.navigateBack({
                    delta: 1
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    }
})
