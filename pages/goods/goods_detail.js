// pages/goods/goods_detail.js
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const auth = require('../../utils/auth.js')
const app = getApp()
const define = require('../../utils/define.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        isShowToast: false, // 커스텀 토스트로출여부
        isShowNoticeDialog: false, // 알림다이얼로그 로출여부
        toastMessage: '', // 토스트메세지내용
        isAutoPlay: false, // 동영상자동플레이여부
        navTitle: '', // 네베게이션 타이틀
        shopId: 0, // 점포아이디
        goodsId: 0, // 상품아이디
        goodsImages: [], // 상품이미지배렬
        sizeId: 0, // 옵션상품아이디
        goodsName: '', // 상품명
        goodsStatus: '', // 상품상태
        goodsIntro: '', // 상품소개글
        originalPrice: 0, // 이전판매가
        salesPrice: 0, // 판매가
        goodsWeight: 0, // 상품무게
        adWords: '', // 광고글1
        adWords2: '', // 광고글2
        goodsUnit: '', // 상품단위
        collectionStatus: '', // 즐겨찾기 추가여부
        goodsVideo: '', // 상품동영상URL
        sizes: [], // 옵션상품배렬
        props: [], //  상품속성배렬
        shopName: '', // 점포명
        age: 0, // 점포오픈년도
        starNum: 0, // 점포등급
        goodsNum: 0, // 점포에 속한 총상품수
        avatarUri: '', // 점포이미지
        shopIntro: '', // 점포소개글
        goods: [], // 점포에 속한 상품배렬
        eventStatus: false,
        eventGoodsStatus: '0',
        optGoodsName: '', // 상품속성메뉴에서의 상품명
        optGoodsUri: '', // 상품속성메뉴에서의 썸네일
        optSalePrice: 0, // 상품속성메뉴에서 선택된 옵션상품의 판매가격
        optWeight: 0, // 상품속성메뉴에서 선택된 옵션상품의 무게
        optGoodsFirstPrice: 0, // 상품속성메뉴에서 옵션상품이 있는 경우 첫 옵션상품의 가격
        optGoodsLastPrice: 0, // 상품속성메뉴에서 옵션상품이 있는 경우 마지막 옵션상품의 가격
        goodsCount: 1, // 상품구매개수
        cartCount: 0, // 장바구니에 담긴 상품개수
        footer: '', // 푸터
        waterMarkPic: '', // 서시장마크이미지
        waterMarkWord: '', // 서시장이미지글,
        isAdWord: true, // 광고글 로출 상태
        menuHeight: app.globalData.isDeviceHeight, // 폰종류에 따르는 메뉴높이값
        isShowOption: false, // 옵션툴로출여부
        isShowGoodsCount: false, // 상품개수설정부분 로출여부
        activeId: 0, // 상품속성메뉴에서 옵션상품들을 선택했을 때 해당 옵션상품의 아이디
        // 볼설정값
        balls: {
            show: false,
            el: null
        },
        // 볼 첫 위치
        ball_style: {
            left: 0,
            top: 0
        },
        pos_x: 0,
        freePackageStatus: '0',
        freePackageNeededPrice: 0,
        freeShippingStatus: '0',
        freeShippingNeededPrice: 0
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'goods_detail')
        util.setEnableShareWechat()
        this.setData({
            pageLoading: true,
            isShowNoticeDialog: util.setCalcTimeNotice(define.START_DATE, define.END_DATE, util.formatDate(new Date(), '/'), wx.getStorageSync('notice_popup')) // 알림다이얼로그 로출설정값
        })

        // 쇼핑몰정보가 존재하지 않으면 app.js의 setInitData함수를 콜백으로 다시 호출
        if (wx.getStorageSync('siteinfo') === '') {
            app.setInitDataCallback = () => {
                this.setData({
                    waterMarkPic: wx.getStorageSync('siteinfo').watermarkPic,
                    waterMarkWord: wx.getStorageSync('siteinfo').watermarkWord,
                    freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
                    freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
                    freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
                    freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
                })
            }
        } else {
            this.setData({
                waterMarkPic: wx.getStorageSync('siteinfo').watermarkPic,
                waterMarkWord: wx.getStorageSync('siteinfo').watermarkWord,
                freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
                freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0,
                freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
                freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0
            })
        }

        // QR코드 스캔으로 들어오는 경우
        if (options.scene) {
            this.setData({
                shopId: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'shopid')),
                goodsId: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'productid'))
            })
        } else {
            this.setData({
                shopId: parseInt(options.shopid),
                goodsId: parseInt(options.productid)
            })
        }

        setInterval(() => {
            this.setData({
                isAdWord: !this.data.isAdWord
            })
        }, 1000)

        this.getShopData()
        this.getGoodsData()

        this.setData({
            pageLoading: false
        })
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
    onShareAppMessage: function () {
        return {
            title: this.data.navTitle,
            path: '/pages/goods/goods_detail?shopid=' + this.data.shopId + '&productid=' + this.data.goodsId
        }
    },
    onShareTimeline: function () {
        return {
            title: this.data.navTitle,
            query: {
                key: '/pages/goods/goods_detail?shopid=' + this.data.shopId + '&productid=' + this.data.goodsId
            },
            imageUrl: this.data.goodsImages[0].uri
        }
    },
    // 점포정보 얻기
    getShopData: async function () {
        const response = await api.request(`shops/${this.data.shopId}/${this.data.goodsId}`)

        if (response.action) {
            if (response !== null) {
                const status = response.data.goods.find((rs) => rs.eventStatus === '1')

                this.setData({
                    shopName: response.data.shopName,
                    age: response.data.age,
                    starNum: response.data.starNum,
                    goodsNum: response.data.goodsNum,
                    avatarUri: response.data.avatarUri,
                    shopIntro: response.data.shopIntro,
                    goods: response.data.goods,
                    eventStatus: status ? true : false
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
    },
    // 상품정보 얻기
    getGoodsData: async function () {
        const response = await api.request(`goods/${this.data.goodsId}`)

        if (response.action) {
            if (response !== null) {
                this.setData({
                    navTitle: response.data.name,
                    sizeId: response.data.sizeId,
                    goodsName: response.data.name,
                    goodsImages: response.data.imgs,
                    sizes: response.data.sizes,
                    props: response.data.props,
                    goodsStatus: response.data.status,
                    goodsIntro: response.data.intro,
                    originalPrice: response.data.originalPrice,
                    salesPrice: response.data.salesPrice,
                    goodsWeight: response.data.weight,
                    adWords: response.data.adWords,
                    adWords2: response.data.adWords2,
                    goodsUnit: response.data.unit,
                    collectionStatus: response.data.collectionStatus,
                    footer: wx.getStorageSync('siteinfo').salesStatement,
                    goodsVideo: response.data.video,
                    eventGoodsStatus: response.data.eventStatus ? response.data.eventStatus : '0'
                })

                if (response.data.video !== '' && response.data.video !== null && response.data.video !== undefined) {
                    this.getWifiInfo()
                }
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
    },
    detailMedia: function (e) {
        const urls = []
        const current = e.currentTarget.dataset.index // 선택된 오브젝트(이미지, 동영상)

        // 동영상이 있으면 배렬의 첫 요소에 추가
        if (this.data.goodsVideo !== '' && this.data.goodsVideo !== null) {
            const value = {
                type: 'video',
                url: this.data.goodsVideo
            }

            urls.push(value)
        }

        this.data.goodsImages.filter((res) => {
            let value = {
                type: 'image',
                url: res.uri
            }

            urls.push(value)
        })

        wx.previewMedia({
            current: current,
            sources: urls,
            success: function (res) {}
        })
    },
    // 즐겨찾기 추가/삭제
    setFavority: async function () {
        if (wx.getStorageSync('token') === '') {
            const userInfo = await auth.getUserProfile()
            this.setData({
                pageLoading: true
            })
            const isLogin = await auth.isLoginByWeiXin(userInfo)

            // 위챗로그인이 성공이라면 페지 리로드
            if (isLogin) {
                this.setData({
                    cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count'))
                })
                this.getShopData()
                this.getGoodsData()
            }

            this.setData({
                pageLoading: false
            })

            return
        }

        this.setData({
            pageLoading: true
        })

        const response = await api.request(`goodsCollections/${this.data.goodsId}`, {}, 'POST')

        if (response.action) {
            this.setData({
                pageLoading: false
            })

            if (this.data.collectionStatus === '0') {
                util.showToast('已收藏', 'success', '', 2000, true)
                this.setData({
                    collectionStatus: '1'
                })
            } else {
                util.showToast('已取消收藏', 'success', '', 2000, true)
                this.setData({
                    collectionStatus: '0'
                })
            }
        } else {
            this.setData({
                pageLoading: false
            })
        }
    },
    // 메뉴 클릭 설정
    setMenu: async function (e) {
        switch (e.currentTarget.dataset.menu) {
            case 'main':
                wx.reLaunch({ url: '/pages/main/main' })
                break
            case 'service':
                wx.reLaunch({
                    url: '/pages/service/service'
                })
                break
            case 'favority':
                this.setFavority()
                break
            case 'cart':
                if (wx.getStorageSync('token') === '') {
                    const userInfo = await auth.getUserProfile()
                    this.setData({
                        pageLoading: true
                    })
                    const isLogin = await auth.isLoginByWeiXin(userInfo)
                    this.setData({
                        pageLoading: false
                    })

                    if (isLogin) {
                        wx.navigateTo({
                            url: '/pages/goods/cart/cart'
                        })
                    }
                } else {
                    wx.navigateTo({
                        url: '/pages/goods/cart/cart'
                    })
                }
                break
        }
    },
    // 옵션메뉴 클릭 설정
    setActiveOption: function (e) {
        this.setData({
            activeId: e.currentTarget.dataset.optionid,
            isShowGoodsCount: true,
            goodsCount: 1
        })

        this.data.sizes.filter((res) => {
            if (res.id === e.currentTarget.dataset.optionid) {
                this.setData({
                    optSalePrice: res.sizePrice,
                    optGoodsUri: res.imgUri,
                    optWeight: res.sizeWeight
                })
            }
        })
    },
    // 상품옵션설정 툴 로출 설정
    setShowOption: function (e) {
        if (e.currentTarget.dataset.show === 'show') {
            this.setData({
                isShowOption: true,
                optGoodsUri: this.data.goodsImages[0].uri,
                optGoodsName: this.data.goodsName,
                optSalePrice: this.data.sizes.length === 0 ? this.data.salesPrice : 0,
                optWeight: this.data.sizes.length === 0 ? this.data.goodsWeight : 0,
                optGoodsFirstPrice: this.data.sizes.length !== 0 ? this.data.sizes[0].sizePrice : 0,
                optGoodsLastPrice: this.data.sizes.length !== 0 ? this.data.sizes[this.data.sizes.length - 1].sizePrice : 0,
                isShowGoodsCount: this.data.sizes.length === 0 ? true : false,
                activeId: 0,
                goodsCount: 1
            })
        }

        if (e.currentTarget.dataset.show === 'hide') {
            this.setData({
                isShowOption: false
            })
        }
    },
    // 상품 구매하기
    setBuying: async function (e) {
        // 위챗로그인이 안되여있으면 위챗로그인 진행
        if (wx.getStorageSync('token') === '') {
            const userInfo = await auth.getUserProfile()
            this.setData({
                pageLoading: true
            })
            const isLogin = await auth.isLoginByWeiXin(userInfo)

            if (isLogin) {
                this.setData({
                    cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count'))
                })
                this.getShopData()
                this.getGoodsData()
            }

            this.setData({
                pageLoading: false
            })

            return
        }

        const prod = await api.request(`goods/${this.data.goodsId}`)

        if (prod.action) {
            if (prod !== null) {
                if (prod.data.status === '0') {
                    this.setData({
                        isShowToast: true,
                        toastMessage: '该商品已下架。'
                    })

                    return
                }
            }
        }

        if (!this.data.balls.show) {
            // 볼이 떨어지는 시작위치 요소위치정보 얻기
            const infoStart = await util.getElementProperties('.quantity-info')
            // 볼이 떨어지는 끝위치의 요소위치정보 얻기
            const infoEnd = await util.getElementProperties('.left-item')

            this.setData({
                balls: {
                    show: true,
                    el: {
                        clientX: infoStart[0].left + 55,
                        clientY: infoStart[0].top
                    }
                },
                pos_x: infoEnd[0].width * 3.4
            })
        }
    },
    // 상품개수 감소
    setMinus: function (e) {
        // 상품개수가 1이면 상품개수 감소 중단
        if (this.data.goodsCount === 1) {
            return
        }

        this.setData({
            goodsCount: parseInt(this.data.goodsCount) - 1
        })

        // 옵션상품이 존재하면
        if (this.data.sizes.length !== 0) {
            this.data.sizes.filter((res) => {
                if (res.id === this.data.activeId) {
                    this.setData({
                        optSalePrice: util.setCalculatePriceAndQuantity(res.sizePrice, this.data.optSalePrice, 0, 'minus'),
                        optWeight: parseFloat(this.data.optWeight) - parseFloat(res.sizeWeight)
                    })
                }
            })
        } else {
            this.setData({
                optSalePrice: util.setCalculatePriceAndQuantity(this.data.salesPrice, this.data.optSalePrice, 0, 'minus'),
                optWeight: parseFloat(this.data.optWeight) - parseFloat(this.data.goodsWeight)
            })
        }
    },
    // 상품개수 증가
    setPlus: function (e) {
        // 개수가 99개 이상이면 상품개수 증가 중단
        if (parseInt(this.data.goodsCount) >= 99) {
            return
        }

        this.setData({
            goodsCount: parseInt(this.data.goodsCount) + 1
        })

        // 옵션상품이 존재하면
        if (this.data.sizes.length !== 0) {
            this.data.sizes.filter((res) => {
                if (res.id === this.data.activeId) {
                    this.setData({
                        optSalePrice: util.setCalculatePriceAndQuantity(res.sizePrice, 0, this.data.goodsCount, 'plus'),
                        optWeight: parseFloat(res.sizeWeight) * parseInt(this.data.goodsCount)
                    })
                }
            })
        } else {
            this.setData({
                optSalePrice: util.setCalculatePriceAndQuantity(this.data.salesPrice, 0, this.data.goodsCount, 'plus'),
                optWeight: parseFloat(this.data.goodsWeight) * parseInt(this.data.goodsCount)
            })
        }
    },
    inputKey: function (e) {
        this.setData({
            goodsCount: e.detail.value.replace(/[^0-9]/g, '')
        })

        const isNumber = /^[0-9]+$/

        // 입력되는 값이 빈문자렬이면
        if (!isNumber.test(this.data.goodsCount)) {
            // 옵션상품이 존재하면
            if (this.data.sizes.length !== 0) {
                this.data.sizes.filter((res) => {
                    if (res.id === this.data.activeId) {
                        this.setData({
                            optSalePrice: res.sizePrice,
                            optWeight: res.sizeWeight
                        })
                    }
                })
            } else {
                this.setData({
                    optSalePrice: this.data.salesPrice,
                    optWeight: this.data.goodsWeight
                })
            }
        } else {
            // 옵션상품이 존재하면
            if (this.data.sizes.length !== 0) {
                this.data.sizes.filter((res) => {
                    if (res.id === this.data.activeId) {
                        this.setData({
                            optSalePrice: util.setCalculatePriceAndQuantity(res.sizePrice, 0, this.data.goodsCount, 'plus'),
                            optWeight: parseFloat(res.sizeWeight) * parseInt(this.data.goodsCount)
                        })
                    }
                })
            } else {
                this.setData({
                    optSalePrice: util.setCalculatePriceAndQuantity(this.data.salesPrice, 0, this.data.goodsCount, 'plus'),
                    optWeight: parseFloat(this.data.goodsWeight) * parseInt(this.data.goodsCount)
                })
            }
        }
    },
    inputBlue: function (e) {
        // 입력포커스가 해제될 때 입력된 값이 없으면 디폴트로 상품개수를 1로 설정
        if (e.detail.value === '') {
            this.setData({
                goodsCount: 1
            })
        }
    },
    // 볼컴포넨트에서 설정된 값으로 초기화(볼애니메이션 완료 알리기)
    endBallEvent: function (e) {
        this.setData({
            balls: e.detail
        })

        // 장바구니 상품추가 부분
        const query = {
            goodsId: parseInt(this.data.goodsId),
            sizeId: this.data.sizes.length === 0 ? this.data.sizeId : this.data.activeId,
            num: this.data.goodsCount
        }

        api.request('carts', query, 'POST').then((response) => {
            if (response.action) {
                api.request('carts/num').then((resp) => {
                    if (resp.data !== null) {
                        wx.setStorageSync('cart_count', resp.data)
                        this.setData({
                            cartCount: resp.data,
                            isShowToast: true,
                            toastMessage: '已成功加入购物车'
                        })
                    }
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    endToast: function (e) {
        this.setData({
            isShowToast: false
        })
    },
    setActionNotice: function (e) {
        if (e.detail === 'show') {
            wx.setStorageSync('notice_popup', util.formatDate(new Date(), '/'))
            this.setData({
                isShowNoticeDialog: false
            })
        }

        if (e.detail === 'close') {
            this.setData({
                isShowNoticeDialog: false
            })
        }
    },
    getWifiInfo: function () {
        const that = this
        wx.getNetworkType({
            success(res) {
                if (res.networkType === 'wifi') {
                    that.setData({
                        isAutoPlay: true
                    })
                }
            }
        })
    }
})
