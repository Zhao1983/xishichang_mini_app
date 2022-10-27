// pages/mypage/myinfo/phone_update/phone_update.js
const api = require('../../../../utils/request.js')
const util = require('../../../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '更换绑定手机号', // 네비게이션 타이틀
        phone: ''
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()
        this.setData({
            pageLoading: true
        })

        api.request('profile').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        phone: response.data.phone.slice(0, 3) + '****' + response.data.phone.slice(7, 11)
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
    onShareAppMessage: function () {}
})
