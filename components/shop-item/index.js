// components/shop-item/index.js
const app = getApp()

Component({
    properties: {
        shopId: {
            type: Number,
            value: 0
        },
        shopName: {
            type: String,
            value: ''
        },
        age: {
            type: Number,
            value: 0
        },
        starNum: {
            type: Number,
            value: 0
        },
        shopIntro: {
            type: String,
            value: ''
        },
        goods: {
            type: Array,
            value: [],
            observer: 'initData'
        },
        avatarUri: {
            type: String,
            value: []
        },
        eventStatus: {
            type: Boolean,
            value: false
        },
        view: {
            type: String,
            value: ''
        }
    },
    data: {
        shopIcon: '', // 점포아이콘
        goodsData: [], // 점포에 따르는 상품배렬
        swiperCount: 0, // 화면에 보여지는 스와이프아이템개수
        freePackageStatus: '0',
        freePackageNeededPrice: 0,
        freeShippingStatus: '0',
        freeShippingNeededPrice: 0
    },
    ready() {},
    attached() {
        this.initData()
    },
    detached() {},
    methods: {
        initData: function () {
            let data = []
            const icons = wx.getStorageSync('siteinfo').goodsIconBeans

            if (this.properties.goods !== null) {
                this.properties.goods.filter((res) => {
                    let value = {
                        goodsIconName: res.goodsIconName,
                        goodsImg: res.goodsImg,
                        goodsIntro: res.goodsIntro,
                        goodsName: res.goodsName,
                        goodsUnit: res.goodsUnit,
                        goodsVideo: res.goodsVideo,
                        id: res.id,
                        originalPrice: res.originalPrice,
                        salesPrice: res.salesPrice,
                        sizeId: res.sizeId,
                        goodsIconUrl: '',
                        sizeStatus: res.sizeStatus,
                        eventStatus: res.eventStatus
                    }

                    if (icons !== null && icons !== undefined) {
                        if (icons.length !== 0) {
                            icons.filter((val) => {
                                if (res.goodsIconName === val.iconName && res.goodsIconName !== '' && res.goodsIconName !== null) {
                                    value.goodsIconUrl = val.iconUri
                                }
                            })
                        }
                    }

                    data.push(value)
                })
            }

            this.setData({
                shopIcon: wx.getStorageSync('siteinfo').shopIcon,
                goodsData: data,
                swiperCount: app.globalData.deviceInfo.windowWidth - 60 >= 110 * data.length ? data.length : parseInt((app.globalData.deviceInfo.windowWidth - 60) / 110),
                freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
                freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
                freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
                freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
            })
        }
    }
})
