// components/action-sheet/index.js
const auth = require('../../utils/auth.js')

Component({
    properties: {
        show: {
            type: Boolean,
            value: false
        }
    },
    data: {
        menuGroup: [
            { text: '首页', value: 'main' },
            { text: '分类', value: 'category_detail' },
            { text: '消息', value: 'notice' },
            { text: '购物车', value: 'cart' },
            { text: '我的', value: 'mypage' }
        ]
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        setActionSheet: async function (e) {
            wx.removeStorageSync('deliveryid')
            const pages = getCurrentPages()
            let backCount = 0

            pages.filter((res, index) => {
                if (res.route.search(e.detail.value) !== -1) {
                    backCount = pages.length - 1 - index
                }
            })

            this.triggerEvent('actiontap', false)

            switch (e.detail.value) {
                case 'main':
                    if (backCount === 0) {
                        wx.navigateTo({
                            url: '/pages/main/main'
                        })
                    } else {
                        wx.navigateBack({
                            delta: backCount
                        })
                    }
                    break
                case 'category_detail':
                    if (backCount === 0) {
                        wx.navigateTo({
                            url: '/pages/category/category_detail'
                        })
                    } else {
                        wx.navigateBack({
                            delta: backCount
                        })
                    }
                    break
                case 'notice':
                    if (wx.getStorageSync('token') === '') {
                        const userInfo = await auth.getUserProfile()
                        this.triggerEvent('actiontap', true)
                        const isLogin = await auth.isLoginByWeiXin(userInfo)
                        this.triggerEvent('actiontap', false)

                        if (isLogin) {
                            if (backCount === 0) {
                                wx.navigateTo({
                                    url: '/pages/mypage/notice/notice'
                                })
                            } else {
                                wx.navigateBack({
                                    delta: backCount
                                })
                            }
                        }
                    } else {
                        if (backCount === 0) {
                            wx.navigateTo({
                                url: '/pages/mypage/notice/notice'
                            })
                        } else {
                            wx.navigateBack({
                                delta: backCount
                            })
                        }
                    }
                    break
                case 'cart':
                    if (wx.getStorageSync('callMenuUrl') === 'cart') {
                        this.setCloseSheet()
                    } else if (wx.getStorageSync('token') === '') {
                        const userInfo = await auth.getUserProfile()
                        this.triggerEvent('actiontap', true)
                        const isLogin = await auth.isLoginByWeiXin(userInfo)
                        this.triggerEvent('actiontap', false)

                        if (isLogin) {
                            if (backCount === 0) {
                                wx.navigateTo({
                                    url: '/pages/goods/cart/cart'
                                })
                            } else {
                                wx.navigateBack({
                                    delta: backCount
                                })
                            }
                        }
                    } else {
                        if (backCount === 0) {
                            wx.navigateTo({
                                url: '/pages/goods/cart/cart'
                            })
                        } else {
                            wx.navigateBack({
                                delta: backCount
                            })
                        }
                    }
                    break
                case 'mypage':
                    if (wx.getStorageSync('token') === '') {
                        const userInfo = await auth.getUserProfile()
                        this.triggerEvent('actiontap', true)
                        const isLogin = await auth.isLoginByWeiXin(userInfo)
                        this.triggerEvent('actiontap', false)

                        if (isLogin) {
                            if (backCount === 0) {
                                wx.navigateTo({
                                    url: '/pages/mypage/mypage'
                                })
                            } else {
                                wx.navigateBack({
                                    delta: backCount
                                })
                            }
                        }
                    } else {
                        if (backCount === 0) {
                            wx.navigateTo({
                                url: '/pages/mypage/mypage'
                            })
                        } else {
                            wx.navigateBack({
                                delta: backCount
                            })
                        }
                    }
                    break
            }
        },
        setCloseSheet: function () {
            this.triggerEvent('actiontap', false)
        }
    }
})
