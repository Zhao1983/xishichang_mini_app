// components/order-item/index.js

Component({
    properties: {
        orderId: {
            type: Number,
            value: 0
        },
        orderStatus: {
            type: Number,
            value: 0
        },
        orderPrice: {
            type: Number,
            value: 0
        },
        orderNumber: {
            type: String,
            value: '0'
        },
        shops: {
            type: Array,
            value: []
        },
        deliveries: {
            type: Array,
            value: []
        },
        viewKind: {
            type: String,
            value: ''
        },
        deliveryType: {
            type: Number,
            value: 0
        },
        totalDeliveryPrice: {
            type: Number,
            value: 0
        },
        packagePrice: {
            type: Number,
            value: 0
        },
        totalGoodsPrice: {
            type: Number,
            value: 0
        },
        refundDt: {
            type: String,
            value: ''
        },
        pageCount: {
            type: Number,
            value: 0
        }
    },
    data: {
        isShowDeliveryInfo: false
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        deliveryInfo: function (e) {
            const data = {
                orderid: e.currentTarget.dataset.orderid,
                ordernumber: e.currentTarget.dataset.ordernumber
            }
            this.triggerEvent('actiondelivery', data)
        },
        setCancelOrder: function (e) {
            this.triggerEvent('cancelorder', e.currentTarget.dataset.orderid)
        },
        setRefundOrder: function (e) {
            this.triggerEvent('refundorder', e.currentTarget.dataset.orderid)
        },
        setPayOrder: function (e) {
            const data = {
                orderid: e.currentTarget.dataset.orderid,
                ordernumber: e.currentTarget.dataset.ordernumber
            }
            this.triggerEvent('payorder', data)
        },
        setReceive: function (e) {
            this.triggerEvent('receive', e.currentTarget.dataset.orderid)
        },
        setDeliveryInfo: function () {
            this.setData({
                isShowDeliveryInfo: !this.data.isShowDeliveryInfo
            })
        },
        setShowHelp: function (e) {
            this.triggerEvent('showhelp')
        },
        redirectDetail: function (e) {
            wx.setStorageSync('pageCount', this.properties.pageCount)
            wx.navigateTo({
                url: '/pages/mypage/order/order_detail/order_detail?orderid=' + e.currentTarget.dataset.orderid
            })
        }
    }
})
