// pages/main/main.js
const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const define = require('../../utils/define.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        loadingMore: false,
        navTitle: '', // 네베게이션 타이틀
        tags: [], // 검색키워드배렬
        bannerData: [], // 배너배렬
        typeData: [], // 분류배렬
        shopData: [], // 점포배렬
        isScroll: false, // 스크롤 진행여부
        cartCount: 0, // 장바구니에 담긴 상품개수
        isShowSearch: false, // 검색바 로출여부
        scrollTop: 0, // 페지의 스크롤위치값
        isPageRefreshTrigger: false,
        isRefreshPage: false,
        heightContent: 0,
        isShowNoticeDialog: false, // 알림다이얼로그 로출여부
        isMoreText: false, // 맨 밑의 텍스트로출
        totalNum: 0, // 총 점포수
        totalPage: 1, // 총 페지수
        page: 1, // 페지수
        size: 10, // 페지당 점포수
        isGrayLayout: false
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function () {
        wx.setStorageSync('callMenuUrl', 'main')
        util.setEnableShareWechat()
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')

        if (elementNavigation[0] !== null) {
            this.setData({
                heightContent: app.globalData.deviceInfo.windowHeight - elementNavigation[0].height
            })
        }

        this.setData({
            pageLoading: true,
            isGrayLayout: util.setCalcTimeGrayLayout(define.START_GRAY_LAYOUT_DATE, define.END_GRAY_LAYOUT_DATE),
            isShowNoticeDialog: util.setCalcTimeNotice(define.START_DATE, define.END_DATE, util.formatDate(new Date(), '/'), wx.getStorageSync('notice_popup')) // 알림다이얼로그 로출설정값
        })

        // 쇼핑몰정보가 존재하지 않으면 app.js의 setInitData함수를 콜백으로 다시 호출
        if (wx.getStorageSync('siteinfo') === '') {
            app.setInitDataCallback = () => {
                this.setData({
                    navTitle: wx.getStorageSync('siteinfo').name,
                    tags: wx.getStorageSync('siteinfo').tags.split(',')
                })
            }
        } else {
            this.setData({
                navTitle: wx.getStorageSync('siteinfo').name,
                tags: wx.getStorageSync('siteinfo').tags.split(',')
            })
        }

        this.getBannerData()
        this.getTypeData()
        this.getShopData()
    },
    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        wx.setStorageSync('callMenuUrl', 'main')

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
            path: '/pages/main/main'
        }
    },
    /**
     * Called when scroll move
     */
    onPageScroll: async function () {},
    // 스크롤뷰의 스크롤 이벤트
    setScrollEvent: function (e) {
        this.setData({
            isScroll: e.detail.scrollTop > 200 ? true : false,
            isShowSearch: e.detail.scrollTop > 155 ? true : false
        })
    },
    // 스크롤 우로 올리기
    setScrollTop: function () {
        this.setData({
            scrollTop: 0
        })
    },
    // 페지 리로드 설정
    setRefreshPage: function (e) {
        if (this.data.isRefreshPage) {
            return
        }

        this.setData({
            isRefreshPage: true
        })

        setTimeout(() => {
            this.getBannerData()
            this.getTypeData()
            this.getShopData()

            this.setData({
                isPageRefreshTrigger: false,
                isRefreshPage: false
            })
        }, 3000)
    },
    // 배너데이터 얻기
    getBannerData: async function () {
        const response = await api.request('home/ads')

        if (response.action) {
            if (response.data !== null) {
                this.setData({
                    bannerData: response.data
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
    // 분류데이터 얻기
    getTypeData: async function () {
        let count = 0
        let tempData = []
        let data = []

        const response = await api.request('types')

        if (response.action) {
            if (response.data !== null) {
                response.data.filter((res) => {
                    if (count === 10) {
                        data.push(tempData)
                        tempData = []
                        count = 0
                    }

                    tempData.push(res)
                    count++
                })

                if (tempData.length !== 0) {
                    data.push(tempData)
                }
            } else {
                this.setData({
                    pageLoading: false
                })
            }

            this.setData({
                typeData: data
            })
        } else {
            this.setData({
                pageLoading: false
            })
        }
    },
    // 점포데이터 얻기
    getShopData: async function () {
        const query = {
            page: this.data.page
        }
        const response = await api.request('home/shops', query)

        if (response.action) {
            if (response.data !== null) {
                response.data.list.filter((res) => {
                    const status = res.goods.find((rs) => rs.eventStatus === '1')
                    res.eventStatus = status ? true : false
                    this.data.shopData.push(res)
                })

                this.setData({
                    shopData: this.data.shopData,
                    totalNum: response.data.totalNum,
                    page: response.data.page,
                    size: response.data.size,
                    totalPage: response.data.totalNum % response.data.size === 0 ? parseInt(response.data.totalNum / response.data.size) : parseInt(response.data.totalNum / response.data.size) + 1,
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
    },
    // 배너클릭 이벤트
    clickBannerItem: function (e) {
        const index = e.currentTarget.dataset.index
        const data = this.data.bannerData[index]

        switch (data.adType) {
            case 2: // 상품
                wx.navigateTo({
                    url: '/pages/goods/goods_detail?shopid=' + data.additionalInfo + '&productid=' + data.entityId
                })
                break
            case 3: // 점포
                wx.navigateTo({
                    url: '/pages/shop/shop_detail?shopid=' + data.entityId + '&productid=0'
                })
                break
            case 4: // 이벤트
            case 5: // 주제
                break
            case 6: // 검색키워드
                this.addSearchWord(data.entityName)
                wx.navigateTo({
                    url: '/pages/search/search_result/search_result?word=' + data.entityName + '&typeid=0'
                })
                break
        }
    },
    // 최근검색어 스토리지에 보관
    addSearchWord: function (word) {
        let isExist = false
        const words = wx.getStorageSync('words')
        const array = words === '' ? [] : words.split(',')

        array.filter((res) => {
            if (word === unescape(res.trim())) {
                isExist = true
            }
        })

        if (!isExist) {
            if (words === '') {
                wx.setStorageSync('words', escape(word.trim()))
            } else {
                wx.setStorageSync('words', escape(word.trim()) + ',' + words)
            }
        }
    },
    setMenuAction: function (e) {
        this.setData({
            pageLoading: e.detail
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
    setScrollReachBottom: function (e) {
        if (this.data.loadingMore) {
            return
        }

        if (this.data.totalPage > this.data.page) {
            this.setData({
                page: this.data.page + 1,
                loadingMore: true
            })

            setTimeout(() => {
                this.getShopData()
                this.setData({
                    loadingMore: false
                })
            }, 1000)
        } else {
            this.setData({
                isMoreText: true
            })
        }
    }
})
