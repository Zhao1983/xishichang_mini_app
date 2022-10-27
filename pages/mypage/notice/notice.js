// pages/mypage/notice/notice.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '消息', // 네베게이션 타이틀
        cartCount: 0, // 장바구니에 담긴 개수
        noticeCount: 0 // 알림개수
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'notice')
        util.setDisableShareWechat()
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        app.getCartCount().then(() => {
            this.setData({
                cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count')) // 장바구니개수 얻기
            })
        })

        this.getMessageCount()
    },

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
    // 알림개수 얻기
    getMessageCount: function () {
        this.setData({
            pageLoading: true
        })

        api.request('msg/unreadNum').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        noticeCount: response.data,
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
    setMenuAction: function (e) {
        this.setData({
            pageLoading: e.detail
        })
    }
})
