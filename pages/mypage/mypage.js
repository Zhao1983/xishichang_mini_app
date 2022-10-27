// pages/mypage/mypage.js
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '我的信息', // 네비게이션 타이틀
        cartCount: 0, // 장바구니에 담긴 개수
        isDeviceHeight: app.globalData.isDeviceHeight,
        userId: 0, // 사용자아이디
        nickName: '', // 사영자명
        userAvatar: '', // 아바타이미지
        payCount: 0, // 미지불주문수
        deliveryCount: 0, // 수화대기주문수
        receiveCount: 0, // 수거대기주문수
        messageCount: 0 // 수신된 푸시개수
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'mypage')
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
        wx.removeStorageSync('pageCount')
        this.setData({
            pageLoading: true
        })

        this.getProfileData()
        this.getOrderNumber()
        this.getMessageCount()
        app.getCartCount().then(() => {
            this.setData({
                cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count')) // 장바구니개수 얻기
            })
        })
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
    // 사용자프로필 정보 얻기
    getProfileData: function () {
        api.request('profile').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        userId: response.data.id,
                        nickName: response.data.nick,
                        userAvatar: response.data.avatar
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
    // 알림개수 얻기
    getMessageCount: function () {
        api.request('msg/unreadNum').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        messageCount: response.data
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
    // 주문과 관련한 개수 얻기
    getOrderNumber: function () {
        api.request('orders/num').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    response.data.filter((res) => {
                        // 미지불
                        if (res.status === 1) {
                            this.setData({
                                payCount: res.num
                            })
                        }

                        // 수화대기
                        if (res.status === 2) {
                            this.setData({
                                deliveryCount: res.num
                            })
                        }

                        // 수거대기
                        if (res.status === 3) {
                            this.setData({
                                receiveCount: res.num
                            })
                        }
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
