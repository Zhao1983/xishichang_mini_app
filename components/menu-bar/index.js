// components/menu-bar/index.js
const util = require('../../utils/util.js')
const auth = require('../../utils/auth.js')
const app = getApp()

Component({
    properties: {
        activeUrl: {
            type: String,
            value: ''
        },
        cartCount: {
            type: Number,
            value: 0
        },
        isAnimate: {
            type: Boolean,
            value: true,
            observer: 'setAnimation'
        }
    },
    data: {
        isDeviceHeight: app.globalData.isDeviceHeight,
        animateMenu: null
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        redirectUrl: async function (e) {
            wx.removeStorageSync('deliveryid')
            const url = e.currentTarget.dataset.url

            // 로딩된 페지가 해당 페지라면 리턴
            if (url === wx.getStorageSync('callMenuUrl')) {
                return
            }

            this.triggerEvent('actiontap', false)

            switch (url) {
                case 'main':
                    wx.reLaunch({ url: '/pages/main/main' })
                    break
                case 'type':
                    wx.reLaunch({ url: '/pages/category/category_detail' })
                    break
                case 'service':
                    wx.reLaunch({
                        url: '/pages/service/service'
                    })
                    break
                case 'cart':
                    if (wx.getStorageSync('token') === '') {
                        const userInfo = await auth.getUserProfile()
                        this.triggerEvent('actiontap', true)
                        const isLogin = await auth.isLoginByWeiXin(userInfo)
                        this.triggerEvent('actiontap', false)

                        if (isLogin) {
                            wx.reLaunch({ url: '/pages/goods/cart/cart' })
                        }
                    } else {
                        wx.reLaunch({ url: '/pages/goods/cart/cart' })
                    }
                    break
                case 'mypage':
                    if (wx.getStorageSync('token') === '') {
                        const userInfo = await auth.getUserProfile()
                        this.triggerEvent('actiontap', true)
                        const isLogin = await auth.isLoginByWeiXin(userInfo)
                        this.triggerEvent('actiontap', false)

                        if (isLogin) {
                            wx.reLaunch({ url: '/pages/mypage/mypage' })
                        }
                    } else {
                        wx.reLaunch({ url: '/pages/mypage/mypage' })
                    }
                    break
            }
        },
        setAnimation: function () {
            const animate = wx.createAnimation({
                duration: 300,
                timingFunction: 'linear'
            })

            util.getElementValue('#menu-tool', () => {
                if (this.properties.isAnimate) {
                    animate.translateY(0).step()
                } else {
                    animate.translateY(85).step()
                }

                this.setData({
                    animateMenu: animate.export()
                })
            })
        }
    }
})
