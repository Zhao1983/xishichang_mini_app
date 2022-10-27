// pages/goods/order_complete/order_complete.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '提交订单', // 네비게이션 타이틀
        audioCtx: null,
        orderNo: '', // 주문번호
        src: '',
        isPayStatus: false // 지불성공여부
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        const audio = wx.createAudioContext('myAudio')
        audio.setSrc('/static/payment_success.mp3')

        this.setData({
            orderNo: options.orderno,
            orderId: options.orderid,
            audioCtx: audio
        })

        this.getStatusOrder()
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
    getStatusOrder: function () {
        api.request(`orders/status/${this.data.orderNo}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    if (response.data.status === 2) {
                        this.setData({
                            isPayStatus: true
                        })
                        this.data.audioCtx.play()
                    } else {
                        setTimeout(() => {
                            api.request(`orders/status/${this.data.orderNo}`).then((resp) => {
                                if (resp.action) {
                                    if (resp.data !== null) {
                                        if (resp.data.status === 2 || resp.data.status === 7 || resp.data.status === 8) {
                                            this.setData({
                                                isPayStatus: true
                                            })
                                            this.data.audioCtx.play()
                                        }
                                    }
                                }
                            })
                        }, 5000)
                    }
                }
            }
        })
    }
})
