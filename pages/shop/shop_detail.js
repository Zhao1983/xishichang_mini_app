// pages/shop/shop_detail.js
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
        pageLoading: false,
        loadingMore: false,
        isViewKind: true, // 상품리스트형식
        isShowNoticeDialog: false, // 알림다이얼로그 로출여부
        navTitle: '', // 뷰타이틀
        shopId: 0, // 점포아이디
        goodsId: 0, // 상품아이디
        shopName: '', // 점포명
        age: 0, // 점포년도
        starNum: 0, // 점포별수
        avatarUri: '', // 점포이미지
        bannerUri: '', // 점포배너이미지
        bgImgUri: '', // 점포백그라운드이미지
        shopIntro: '', // 점포소개내용
        collectionStatus: '0', // 점포좋아요상태
        shopIcon: '', // 점포아이콘
        totalNum: 0, // 총 상품수
        totalPage: 1, // 총 페지수
        page: 1, // 페지수
        size: 10, // 표시되는 상품수
        goodsData: [], // 점포상품배렬
        tempGoodsData: [],
        goodsEvenData: [], // 상품짝수배렬
        goodsOddData: [], // 상품홀수배렬
        tempEvenData: [], // 림시상품짝수배렬
        tempOddData: [], // 림시상품홀수배렬
        isScroll: false, // 스크롤진행여부
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        animateCart: null, // 장바구니애니메이션
        animateSetting: null, // 메뉴애니메이션
        isMoreText: false, // 맨 밑의 텍스트로출
        isShowSheet: false, // 메뉴툴로출여부
        cartCount: 0, // 장바구니에 담긴 개수
        // 볼설정값
        balls: {
            show: false,
            el: null
        },
        // 볼 첫 위치
        ball_style: {
            left: 8,
            top: 0
        }
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setEnableShareWechat()
        this.setData({
            pageLoading: true,
            isShowNoticeDialog: util.setCalcTimeNotice(define.START_DATE, define.END_DATE, util.formatDate(new Date(), '/'), wx.getStorageSync('notice_popup')) // 알림다이얼로그 로출설정값
        })

        // 쇼핑몰정보가 존재하지 않으면 app.js의 setInitData함수를 콜백으로 다시 호출
        if (wx.getStorageSync('siteinfo') === '') {
            app.setInitDataCallback = () => {
                this.setData({
                    shopIcon: wx.getStorageSync('siteinfo').shopIcon
                })
            }
        } else {
            this.setData({
                shopIcon: wx.getStorageSync('siteinfo').shopIcon
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

        this.getShopData()
        this.getGoodsData()
        this.setData({
            pageLoading: false
        })

        setInterval(() => {
            if (this.data.isScroll) {
                this.setData({
                    isScroll: false,
                    isShowControlMenu: false
                })
            } else {
                this.setData({
                    isShowControlMenu: true
                })
            }

            this.setAnimateIcons()
        }, 500)
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
    onReachBottom: function () {
        if (this.data.loadingMore) {
            return
        }

        if (this.data.totalPage > this.data.page) {
            this.setData({
                page: this.data.page + 1,
                loadingMore: true
            })

            setTimeout(() => {
                this.getGoodsData()
                this.setData({
                    loadingMore: false
                })
            }, 1000)
        } else {
            this.setData({
                isMoreText: true
            })
        }
    },

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {
        return {
            title: this.data.navTitle,
            path: '/pages/shop/shop_detail?shopid=' + this.data.shopId + '&productid=' + this.data.goodsId
        }
    },
    onShareTimeline: function () {
        return {
            title: this.data.navTitle,
            query: {
                key: '/pages/shop/shop_detail?shopid=' + this.data.shopId + '&productid=' + this.data.goodsId
            },
            imageUrl: this.data.avatarUri
        }
    },
    /**
     * Called when scroll move
     */
    onPageScroll: function () {
        this.setData({
            isScroll: true
        })
    },
    /**
     * 상품리스트형식 설정
     */
    setViewGoodsList: function () {
        this.setData({
            isViewKind: !this.data.isViewKind
        })
    },
    /**
     * 점포 데이터 얻기
     */
    getShopData: async function () {
        const response = await api.request(`shops/${this.data.shopId}`)

        if (response.action) {
            if (response.data !== null) {
                this.setData({
                    navTitle: response.data.shopName,
                    age: parseInt(response.data.age),
                    avatarUri: response.data.avatarUri,
                    bannerUri: response.data.bannerUri,
                    bgImgUri: response.data.bgImgUri,
                    shopIntro: response.data.shopIntro,
                    starNum: parseInt(response.data.starNum),
                    collectionStatus: response.data.collectionStatus,
                    shopName: response.data.shopName
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
    // 점포 좋아하기 설정
    setCollection: async function () {
        if (wx.getStorageSync('token') === '') {
            const userInfo = await auth.getUserProfile()
            this.setData({
                pageLoading: true
            })
            const isLogin = await auth.isLoginByWeiXin(userInfo)

            // 위챗로그인이 성공이라면 페지 리로드
            if (isLogin) {
                this.setData({
                    cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count')) // 장바구니개수 얻기
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
        const response = await api.request(`shopCollections/${this.data.shopId}`, {}, 'POST')

        if (response.action) {
            this.setData({
                collectionStatus: this.data.collectionStatus === '0' ? '1' : '0',
                pageLoading: false
            })
        } else {
            this.setData({
                pageLoading: false
            })
        }
    },
    // 점포상품 얻기
    getGoodsData: async function () {
        let response = null
        const query = {
            orderType: 0,
            page: this.data.page,
            size: this.data.size
        }

        if (this.data.goodsId === 0) {
            response = await api.request(`shops/goods/${this.data.shopId}`, query, 'GET')
        } else {
            response = await api.request(`shops/goods/${this.data.shopId}/${this.data.goodsId}`, query, 'GET')
        }

        if (response.action) {
            if (response.data !== null) {
                this.setData({
                    totalNum: parseInt(response.data.totalNum),
                    size: parseInt(response.data.size),
                    page: parseInt(response.data.page),
                    totalPage: response.data.totalNum % response.data.size === 0 ? parseInt(response.data.totalNum / response.data.size) : parseInt(response.data.totalNum / response.data.size) + 1
                })

                if (response.data.list !== null) {
                    response.data.list.filter((res, index) => {
                        if (index % 2 === 0) {
                            this.data.tempEvenData.push(res)
                        } else {
                            this.data.tempOddData.push(res)
                        }

                        this.data.tempGoodsData.push(res)
                    })
                }

                this.setData({
                    goodsEvenData: this.data.tempEvenData,
                    goodsOddData: this.data.tempOddData,
                    goodsData: this.data.tempGoodsData
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
    // 장바구니, 메뉴설정 아이콘 애니메이션 설정
    setAnimateIcons: function () {
        const animate = wx.createAnimation({
            duration: 300,
            timingFunction: 'linear'
        })

        // 장바구니아이콘 애니메이션
        util.getElementValue('.cart-position', () => {
            if (this.data.isShowControlMenu) {
                animate.translateX(0).opacity(1).step()
            } else {
                animate.translateX(-50).opacity(0.3).step()
            }

            this.setData({
                animateCart: animate.export()
            })
        })

        // 메뉴설정 애니메이션
        util.getElementValue('.menu-position', () => {
            if (this.data.isShowControlMenu) {
                animate.translateX(0).opacity(1).step()
            } else {
                animate.translateX(50).opacity(0.3).step()
            }

            this.setData({
                animateSetting: animate.export()
            })
        })
    },
    // 자식컴포넨트에서 설정된 값으로 초기화(볼애니메이션 시작 알리기)
    ballEvent: function (e) {
        this.setData({
            balls: e.detail.balls,
            pageLoading: e.detail.loading,
            cartCount: e.detail.cartCount === undefined ? 0 : e.detail.cartCount
        })

        // 위챗로그인이 성공이라면 페지 다시 리로드
        if (e.detail.isLogin) {
            this.setData({
                cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count')) // 장바구니개수 얻기
            })
            this.getShopData()
            this.getGoodsData()
        }
    },
    // 볼컴포넨트에서 설정된 값으로 초기화(볼애니메이션 완료 알리기)
    endBallEvent: function (e) {
        this.setData({
            balls: e.detail
        })
    },
    // 메뉴툴 로출설정
    openActionSheet: function () {
        this.setData({
            isShowSheet: true
        })
    },
    // 메뉴툴 비로출 설정
    closeActionSheet: function (e) {
        this.setData({
            isShowSheet: false,
            pageLoading: e.detail
        })
    },
    // 장바구니페지로 리다이렉트
    redirectCart: async function () {
        // 위챗로그인 안되여있으면 로그인 진행
        if (wx.getStorageSync('token') === '') {
            const userInfo = await auth.getUserProfile()
            this.setData({
                pageLoading: true
            })
            const isLogin = await auth.isLoginByWeiXin(userInfo)

            // 위챗로그인이 성공이라면 페지 리로드
            if (isLogin) {
                wx.navigateTo({
                    url: '/pages/goods/cart/cart'
                })
            }

            this.setData({
                pageLoading: false
            })
        } else {
            wx.navigateTo({
                url: '/pages/goods/cart/cart'
            })
        }
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
    }
})
