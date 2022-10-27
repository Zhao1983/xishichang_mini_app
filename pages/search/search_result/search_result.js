// pages/search/search_result/search_result.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()
const define = require('../../../utils/define.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        loadingMore: false,
        navTitle: '搜索', // 네베게이션 타이틀
        heightNavigation: 0, // 네비게이션높이값
        isEmptyResult: false, // 검색결과가 없는 상태값
        isScroll: false, // 스크롤진행여부
        isScrollTop: false,
        isShowNoticeDialog: false, // 알림다이얼로그 로출여부
        searchWord: '', // 검색어
        tempSearchWord: '', // 림시검색어변수
        typeId: 0, // 분류별아이디
        goodsEvenData: [], // 상품짝수배렬
        goodsOddData: [], // 상품홀수배렬
        tempEvenData: [], // 림시상품짝수배렬
        tempOddData: [], // 림시상품홀수배렬
        totalNum: 0, // 총 상품수
        totalPage: 1, // 총 페지수
        page: 1, // 페지수
        size: 10, // 표시되는 상품수
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [
            {
                text: '确认'
            }
        ],
        isMoreText: false, // 맨 밑의 텍스트로출
        cartCount: 0, // 장바구니에 담긴 개수
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
        isShowControlMenu: true, // 장바구니아이콘로출여부
        paddingContent: app.globalData.isDeviceHeight,
        pos_x: parseInt(app.globalData.deviceInfo.windowWidth / 5) * 3.4 // 메뉴에 포함된 장바구니의 위치값
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        wx.setStorageSync('callMenuUrl', 'search_result')
        util.setEnableShareWechat()

        // QR코드 스캔으로 들어오는 경우
        if (options.scene) {
            this.setData({
                searchWord: util.getQueryString(decodeURIComponent(options.scene), 'word'),
                tempSearchWord: util.getQueryString(decodeURIComponent(options.scene), 'word'),
                typeId: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'typeid'))
            })
        } else {
            this.setData({
                searchWord: options.word,
                tempSearchWord: options.word,
                typeId: options.typeid,
                isShowNoticeDialog: util.setCalcTimeNotice(define.START_DATE, define.END_DATE, util.formatDate(new Date(), '/'), wx.getStorageSync('notice_popup')) // 알림다이얼로그 로출설정값
            })
        }

        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')

        // 네비게이션 높이구하기
        if (elementNavigation[0] !== null) {
            this.setData({
                heightNavigation: elementNavigation[0].height
            })
        }

        this.getSearchData(true)

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
                this.getSearchData(false)
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
            title: this.data.searchWord,
            path: '/pages/search/search_result/search_result?word=' + this.data.searchWord + '&typeid=' + this.data.typeId
        }
    },
    onShareTimeline: function () {
        return {
            title: this.data.searchWord,
            query: {
                key: '/pages/search/search_result/search_result?word=' + this.data.searchWord + '&typeid=' + this.data.typeId
            }
        }
    },
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
    // 검색어 입력 이벤트
    setInputWord: function (e) {
        this.setData({
            tempSearchWord: e.detail.value.trim()
        })
    },
    // 검색결과 보기
    setSearchResult: function () {
        if (this.data.tempSearchWord.trim() === '') {
            this.setData({
                isShowWarningDialog: true
            })
            return
        }

        // 검색어를 입력했을 때 스크롤위치를 초기화
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                duration: 200,
                scrollTop: 0
            })
        }

        this.setData({
            searchWord: this.data.tempSearchWord,
            goodsEvenData: [],
            goodsOddData: [],
            tempEvenData: [],
            tempOddData: [],
            page: 1,
            isMoreText: false
        })

        this.setAddSearchWord(this.data.searchWord)
        this.getSearchData(false)
    },
    // 입력한 검색어 클리어
    setClearSearchWord: function () {
        this.setData({
            tempSearchWord: ''
        })
    },
    // 경고다이얼로그 확인 클릭
    setWarningDialog: function () {
        this.setData({
            isShowWarningDialog: false
        })
    },
    // 검색어에 따르는 상품 얻기
    getSearchData: function (index) {
        this.setData({
            pageLoading: index
        })
        const query = {
            q: this.data.searchWord,
            page: this.data.page,
            size: this.data.size
        }

        if (this.data.typeId !== 0) {
            query.typeId = this.data.typeId
        }

        api.request('goodsSearch', query).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        totalNum: parseInt(response.data.totalNum),
                        size: parseInt(response.data.size),
                        page: parseInt(response.data.page),
                        totalPage: response.data.totalNum % response.data.size === 0 ? parseInt(response.data.totalNum / response.data.size) : parseInt(response.data.totalNum / response.data.size) + 1
                    })

                    if (response.data.list !== null) {
                        response.data.list.filter((res, idx) => {
                            if (idx % 2 === 0) {
                                this.data.tempEvenData.push(res)
                            } else {
                                this.data.tempOddData.push(res)
                            }
                        })
                    }

                    this.setData({
                        goodsEvenData: this.data.tempEvenData,
                        goodsOddData: this.data.tempOddData,
                        isEmptyResult: this.data.totalNum !== 0 ? false : true
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

            this.setData({
                pageLoading: false
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
            this.getSearchData(true)
        }
    },
    // 볼컴포넨트에서 설정된 값으로 초기화(볼애니메이션 완료 알리기)
    endBallEvent: function (e) {
        this.setData({
            balls: e.detail
        })
    },
    // 최근검색어 스토레지에 림시 저장
    setAddSearchWord: function (word) {
        let isExist = false

        if (wx.getStorageSync('words') !== '') {
            const array = wx.getStorageSync('words').split(',')

            array.filter((res) => {
                if (word.trim() === res.trim()) {
                    isExist = true
                }
            })

            if (!isExist) {
                wx.setStorageSync('words', word.trim() + ',' + wx.getStorageSync('words'))
            }
        } else {
            wx.setStorageSync('words', word.trim())
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
    }
})
