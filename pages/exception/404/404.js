// pages/exception/404/404.js
Page({
    /**
     * Page initial data
     */
    data: {
        navTitle: '例外', // 네베게이션 타이틀
        reason: ''
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        this.setData({
            reason: options.reason
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
