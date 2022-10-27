// pages/mypage/history/history.js

const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const auth = require('../../../utils/auth.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false,
        navTitle: '浏览历史', // 뷰타이틀
        navBtnTitle: '清空', // 네비게이션 버튼타이틀
        isNavRightBtn: true,
        isScroll: false, // 스크롤진행여부
        isScrollTop: false,
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        animateCart: null, // 장바구니애니메이션
        animateSetting: null, // 메뉴애니메이션
        isShowSheet: false, // 메뉴툴로출여부
        cartCount: 0, // 장바구니에 담긴 개수
        isEmpty: false,
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [{ text: '否' }, { text: '是' }],
        // 볼설정값
        balls: {
            show: false,
            el: null
        },
        // 볼 첫 위치
        ball_style: {
            left: 8,
            top: 0
        },
        isDeviceHeight: app.globalData.isDeviceHeight,
        heightContent: 0, // 페지 높이값
        scrollTop: 0, // 페지의 스크롤위치값
        historyData: [] // 상품리력 배렬
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        util.setDisableShareWechat()
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')
        if (elementNavigation[0] !== null) {
            this.setData({
                heightContent: app.globalData.deviceInfo.windowHeight - elementNavigation[0].height
            })
        }

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

        this.getHistoryData()
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
    /**
     * Called when scroll move
     */
    onPageScroll: async function () {
        this.setData({
            isScroll: true,
            isScrollTop: await util.isCheckScroll('.container', 200)
        })
    },
    // 스크롤 우로 올리기
    setScrollTop: function () {
        wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
        })
    },
    // 상품리력 정보 얻기
    getHistoryData: function () {
        this.setData({
            pageLoading: true
        })

        api.request('goodsHistories').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        historyData: response.data,
                        isEmpty: response.data.length === 0 ? true : false,
                        isNavRightBtn: response.data.length === 0 ? false : true
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
    // 삭제 처리
    setDeleteConfirm: function (e) {
        this.setData({
            isShowWarningDialog: false
        })

        // 삭제 취소인 경우
        if (e.detail.index === 0) {
            return
        }

        this.setData({
            pageLoading: true
        })

        api.request('goodsHistories', {}, 'DELETE').then((response) => {
            if (response.action) {
                this.getHistoryData()
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 네비게이션 버튼 액션
    setRightBtn: function (e) {
        this.setData({
            isShowWarningDialog: true
        })
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
    }
})
