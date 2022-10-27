// pages/goods/order_goods/order_goods.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '商品清单', // 네비게이션 타이틀
        isDeviceHeight: app.globalData.isDeviceHeight,
        paramCart: '', // 장바구니에서 넘어오는 파라메터
        deliveryId: 0, // 배송지아이디
        deliveryItems: [], // 택배배송회사애 따르는 주문상품배렬
        cartItems: [], // 장바구니에 담겨진 상품 배렬
        deliveryCompanyIndex: 0, // 택배배송회사주문상품배렬인덱스
        kind: '', // 무료배송/유료배송분류값
        freePackageStatus: '0',
        freePackageNeededPrice: 0,
        freeShippingStatus: '0',
        freeShippingNeededPrice: 0
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'order_goods')
        util.setDisableShareWechat()
        this.setData({
            paramCart: options.param,
            deliveryId: parseInt(options.deliveryid),
            deliveryCompanyIndex: parseInt(options.index),
            kind: options.kind
        })

        // 쇼핑몰정보가 존재하지 않으면 app.js의 setInitData함수를 콜백으로 다시 호출
        if (wx.getStorageSync('siteinfo') === '') {
            app.setInitDataCallback = () => {
                this.setData({
                    freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
                    freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
                    freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
                    freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
                })
            }
        } else {
            this.setData({
                freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
                freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
                freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
                freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
            })
        }

        this.getDeliveryData()
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
    getDeliveryData: function () {
        this.setData({
            pageLoading: true
        })

        const query = {
            nums: this.data.paramCart,
            deliveryId: this.data.deliveryId
        }

        api.request('carts/selected/delivery', query).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    let tmpCartItems = []
                    const icons = wx.getStorageSync('siteinfo').goodsIconBeans

                    if (response.data.cartItems !== undefined && response.data.cartItems !== null) {
                        response.data.cartItems.filter((shop) => {
                            shop.goods.filter((prod) => {
                                icons.filter((icon) => {
                                    if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                        prod.goodsIconUrl = icon.iconUri
                                    }
                                })
                            })
                        })
                    }

                    response.data.cartItems.filter((shop) => {
                        let shopInfo = {
                            shopId: shop.shopId,
                            shopName: shop.shopName
                        }
                        let tmpGoods = []

                        shop.goods.filter((goods) => {
                            if (this.data.kind === 'delivery') {
                                // 유료배송
                                response.data.deliveryItems[this.data.deliveryCompanyIndex].goodsImgs.filter((res) => {
                                    if (goods.id === res.id) {
                                        tmpGoods.push(goods)
                                    }
                                })
                            } else if (this.data.kind === 'free') {
                                // 무료배송
                                response.data.freeItems.goodsImgs.filter((res) => {
                                    if (goods.id === res.id) {
                                        tmpGoods.push(goods)
                                    }
                                })
                            } else {
                                response.data.eventItems.goodsImgs.filter((res) => {
                                    if (goods.id === res.id) {
                                        tmpGoods.push(goods)
                                    }
                                })
                            }
                        })

                        if (tmpGoods.length !== 0) {
                            shopInfo.goods = tmpGoods
                            tmpCartItems.push(shopInfo)
                        }
                    })

                    this.setData({
                        cartItems: tmpCartItems,
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
    }
})
