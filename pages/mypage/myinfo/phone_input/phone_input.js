// pages/mypage/myinfo/phone_input/phone_input.js
Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '绑定手机号', // 네비게이션 타이틀
        phone: '', // 폰번호
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [{ text: '确认' }],
        warningTitle: '' // 경고문자내용
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
    // 폰번호 입력체크
    setValue: function (e) {
        this.setData({
            phone: e.detail.value.replace(/[^0-9]/g, '').trim()
        })
    },
    setConfirm: function () {
        if (this.data.phone.trim() === '') {
            this.setShowWarningDialog('请输入电话号码')
            return
        }

        if (this.data.phone.length !== 11) {
            this.setShowWarningDialog('请正确输入电话号码')
            return
        }

        wx.redirectTo({
            url: '/pages/mypage/myinfo/auth_number/auth_number?phone=' + this.data.phone
        })
    },
    // 경고다이얼로그 로출설정
    setShowWarningDialog: function (title) {
        this.setData({
            isShowWarningDialog: true,
            warningTitle: title
        })
    },
    // 경고다이얼로그 액션처리
    setConfirmWarningDialog: function (e) {
        this.setData({
            isShowWarningDialog: false
        })
    }
})
