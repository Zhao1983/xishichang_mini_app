// components/product-vertical-item/index.js
const auth = require('../../utils/auth.js')
const api = require('../../utils/request.js')

Component({
    properties: {
        shopId: {
            type: Number,
            value: 0
        },
        goodsId: {
            type: Number,
            value: 0
        },
        goodsName: {
            type: String,
            value: ''
        },
        goodsImg: {
            type: String,
            value: ''
        },
        goodsIconName: {
            type: String,
            value: '',
            observer: 'initIcon'
        },
        goodsVideo: {
            type: String,
            value: ''
        },
        goodsUnit: {
            type: String,
            value: ''
        },
        goodsIntro: {
            type: String,
            value: ''
        },
        salesPrice: {
            type: Number,
            value: 0
        },
        shopName: {
            type: String,
            value: ''
        },
        originalPrice: {
            type: Number,
            value: 0
        },
        sizeStatus: {
            type: String,
            value: ''
        },
        goodsStatus: {
            type: String,
            value: '1'
        },
        eventStatus: {
            type: String,
            value: '0'
        },
        sizeId: {
            type: Number,
            value: 0
        },
        searchWord: {
            type: String,
            value: ''
        },
        view: {
            type: String,
            value: ''
        },
        balls: {
            type: Object,
            value: {}
        }
    },
    data: {
        goodsIconUrl: '',
        freePackageStatus: '0',
        freePackageNeededPrice: 0,
        freeShippingStatus: '0',
        freeShippingNeededPrice: 0
    },
    ready() {},
    attached() {
        this.setData({
            freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
            freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
            freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
            freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
        })
    },
    detached() {},
    methods: {
        initIcon: function () {
            this.setData({
                goodsIconUrl: ''
            })

            const icons = wx.getStorageSync('siteinfo').goodsIconBeans

            if (icons !== null && icons !== undefined) {
                icons.filter((res) => {
                    if (this.properties.goodsIconName === res.iconName && this.properties.goodsIconName !== '' && this.properties.goodsIconName !== null && this.properties.goodsIconName !== undefined) {
                        this.setData({
                            goodsIconUrl: res.iconUri
                        })
                    }
                })
            }
        },
        setAddCart: async function (e) {
            let data = null

            // ?????????????????? ?????????????????? ??????????????? ??????
            if (wx.getStorageSync('token') === '') {
                const userInfo = await auth.getUserProfile()
                data = {
                    balls: this.properties.balls,
                    loading: true,
                    isLogin: false
                }
                this.triggerEvent('ballevent', data)
                const isLogin = await auth.isLoginByWeiXin(userInfo)
                data = {
                    balls: this.properties.balls,
                    loading: false,
                    isLogin: isLogin
                }
                this.triggerEvent('ballevent', data)

                return
            }

            // ??? ??????????????? ?????? ??????
            if (!this.properties.balls.show) {
                this.properties.balls.show = true
                this.properties.balls.el = e.touches[0]

                // ???????????? ???????????? ??????
                const query = {
                    goodsId: parseInt(this.properties.goodsId),
                    sizeId: this.properties.sizeId,
                    num: 1
                }

                api.request('carts', query, 'POST').then((response) => {
                    if (response.action) {
                        api.request('carts/num').then((resp) => {
                            if (resp.action) {
                                if (resp.data !== null) {
                                    data = {
                                        balls: this.properties.balls,
                                        loading: false,
                                        isLogin: false,
                                        cartCount: resp.data
                                    }
                                    wx.setStorageSync('cart_count', resp.data)

                                    // ??????????????? ?????? dropBall ??? ?????????
                                    this.triggerEvent('ballevent', data)
                                }
                            }
                        })
                    }
                })
            }
        },
        setGoods: function (e) {
            wx.navigateTo({
                url: '/pages/goods/goods_detail?shopid=' + e.currentTarget.dataset.shopid + '&productid=' + e.currentTarget.dataset.goodsid
            })
        }
    }
})
