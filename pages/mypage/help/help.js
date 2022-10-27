// pages/mypage/help/help.js
const util = require('../../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        navTitle: '帮助中心', // 뷰타이틀
        isShowSheet: false // 메뉴툴로출여부
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'help')
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
    // 전화호출
    makePhoneCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: '04332651000',
            success() {}
        })
    },
    // 메뉴툴 로출설정
    openActionSheet: function () {
        this.setData({
            isShowSheet: true
        })
    },
    // 메뉴툴 비로출 설정
    closeActionSheet: function (e) {
        this.setData({
            isShowSheet: false,
            pageLoading: e.detail
        })
    }
})
