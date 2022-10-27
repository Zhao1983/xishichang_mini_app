// pages/search/search.js
const util = require('../../utils/util.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '搜索', // 네베게이션 타이틀
        typeId: 0, // 분류별아이디
        heightNavigation: 0, // 네비게이션높이값
        isShowAllHistoryContent: false, // 검색리력전체보기 로출여부
        isShowAllFavorityContent: false, // 인기검색전체보기 로출여부
        isShowArrowHistory: false, // 검색리력로출버튼 로출여부
        heightHistoryContent: 'auto', // 검색리력요소의 높이값
        isShowArrowFavority: false, // 인기검색로출버튼 로출여부
        heightFavorityContent: 'auto', // 인기검색요소의 높이값
        isShowSheet: false, // 메뉴툴로출여부
        searchWord: '', // 검색어
        recentData: [], // 최근검색어배렬
        recommendData: [], // 인기검색어배렬
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [
            {
                text: '确认'
            }
        ],
        isFocus: true // 검색입력창 초점상태
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        util.setDisableShareWechat()

        // 넘어오는 파라메터중 분류별아이디가 존재하면
        if (options.typeid) {
            this.setData({
                typeId: options.typeid
            })
        }

        // 최근검색어, 인기검색어 설정
        this.setData({
            recentData: wx.getStorageSync('words') !== '' ? wx.getStorageSync('words').split(',') : [],
            recommendData: wx.getStorageSync('siteinfo') !== '' ? wx.getStorageSync('siteinfo').tags.split(',') : []
        })

        // 검색리력을 포함하고 있는 요소의 전체높이 구하기
        const elementHistory = await util.getElementProperties('#history-content')
        // 인기검색어를 포함하고 있는 요소의 전체높이 구하기
        const elementFavority = await util.getElementProperties('#favority-content')
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')

        // 네비게이션 높이구하기
        if (elementNavigation[0] !== null) {
            this.setData({
                heightNavigation: elementNavigation[0].height
            })
        }

        // 검색리력의 내용이 두줄 이상이면 검색리력로출버튼 로출, 컨텐트의 높이를 두줄의 높이로 설정
        if (elementHistory[0] !== null) {
            if (elementHistory[0].height > 78) {
                this.setData({
                    isShowArrowHistory: true,
                    heightHistoryContent: '78px'
                })
            }
        }

        // 인기검색의 내용이 두줄 이상이면 인기검색로출버튼 로출, 컨텐트의 높이를 두줄의 높이로 설정
        if (elementFavority[0] !== null) {
            if (elementFavority[0].height > 78) {
                this.setData({
                    isShowArrowFavority: true,
                    heightFavorityContent: '78px'
                })
            }
        }
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: async function () {
        // 검색리력을 포함하고 있는 요소의 전체높이 구하기
        const elementHistory = await util.getElementProperties('#history-content')
        // 인기검색어를 포함하고 있는 요소의 전체높이 구하기
        const elementFavority = await util.getElementProperties('#favority-content')

        // 최근검색어, 인기검색어 설정
        this.setData({
            recentData: wx.getStorageSync('words') !== '' ? wx.getStorageSync('words').split(',') : [],
            recommendData: wx.getStorageSync('siteinfo') !== '' ? wx.getStorageSync('siteinfo').tags.split(',') : [],
            searchWord: '',
            isFocus: true
        })

        // 검색리력의 내용이 두줄 이상이면 검색리력로출버튼 로출, 컨텐트의 높이를 두줄의 높이로 설정
        if (elementHistory[0] !== null) {
            if (elementHistory[0].height > 39) {
                this.setData({
                    isShowArrowHistory: true,
                    heightHistoryContent: '78px'
                })
            }
        }

        // 인기검색의 내용이 두줄 이상이면 인기검색로출버튼 로출, 컨텐트의 높이를 두줄의 높이로 설정
        if (elementFavority[0] !== null) {
            if (elementFavority[0].height > 39) {
                this.setData({
                    isShowArrowFavority: true,
                    heightFavorityContent: '78px'
                })
            }
        }
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

    // 전체보기
    setShowAll: function (e) {
        if (e.currentTarget.dataset.index === 'history') {
            this.setData({
                isShowAllHistoryContent: !this.data.isShowAllHistoryContent
            })
            this.setData({
                heightHistoryContent: this.data.isShowAllHistoryContent ? 'auto' : '78px'
            })
        }

        if (e.currentTarget.dataset.index === 'favority') {
            this.setData({
                isShowAllFavorityContent: !this.data.isShowAllFavorityContent
            })
            this.setData({
                heightFavorityContent: this.data.isShowAllFavorityContent ? 'auto' : '78px'
            })
        }
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
    // 최근검색어 삭제
    setRemoveRecentData: function () {
        wx.removeStorageSync('words')
        this.setData({
            recentData: [],
            isShowArrowHistory: false,
            isShowAllHistoryContent: false,
            heightHistoryContent: 'auto'
        })
    },
    // 검색어 입력 이벤트
    setInputWord: function (e) {
        this.setData({
            searchWord: e.detail.value.trim()
        })
    },
    // 입력한 검색어 클리어
    setClearSearchWord: function () {
        this.setData({
            searchWord: ''
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
    // 검색결과페지로 리다이렉트
    redirectResult: function (e) {
        if (this.data.searchWord.trim() === '') {
            this.setData({
                isShowWarningDialog: true
            })

            return
        }

        this.setAddSearchWord(this.data.searchWord)
        wx.navigateTo({
            url: '/pages/search/search_result/search_result?word=' + this.data.searchWord + '&typeid=' + this.data.typeId
        })
    },
    // 경고다이얼로그 확인 클릭
    setWarningDialog: function () {
        this.setData({
            isShowWarningDialog: false
        })
    },
    // 최근검색어 아이템 클릭
    setSearchItem: function (e) {
        this.setAddSearchWord(e.currentTarget.dataset.word)

        wx.navigateTo({
            url: '/pages/search/search_result/search_result?word=' + e.currentTarget.dataset.word + '&typeid=' + this.data.typeId
        })
    }
})
