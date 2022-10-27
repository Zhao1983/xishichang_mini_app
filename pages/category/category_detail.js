// pages/category/category_detail.js
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const define = require('../../utils/define.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        loadingMore: false,
        isShowNoticeDialog: false, // 알림다이얼로그 로출여부
        isBackStatus: true, // 뒤로가기 상태값
        navTitle: '分类', // 네베게이션 타이틀
        heightNavigation: 0, // 네비게이션높이값
        isRecommend: false, // 추천상품상태 여부
        typeId: 0, // 대분류 아이디
        subTypeId: 0, // 소분류 아이디,
        position: 0, // 대분류스와이프아이템포지션값
        currentPos: 0, // 스와이프아이템의 현재위치값
        typeData: [], // 대분류 배렬
        subTypeData: [], // 소분류 배렬
        typeName: '', // 대분류명
        subTypeName: '', // 소분류명
        goodsData: [], // 분류별상품배렬
        tempGoodsData: [], // 분류별상품림시배렬
        totalNum: 0, // 총 상품수
        totalPage: 1, // 총 페지수
        page: 1, // 페지수
        size: 10, // 표시되는 상품수
        isScroll: false, // 스크롤진행여부
        isMoreText: false, // 맨 밑의 텍스트로출
        cartCount: 0, // 장바구니에 담긴 개수
        swiperCount: 0, // 화면에 보여지는 스와이프아이템개수
        animateTypeLine: null, // 대분류선택시 빨간테두리애니메이션
        tempPosTypeLine: 0, // 대분류 빨간테두리위치값 림시저장
        contentPos: 0, // 분류콘텐트의 위치값
        contentInnerHeight: 0, // 소분류메뉴와 분류별상품콘텐트의 높이값
        scrollTop: 0, // 스크롤뷰의 스크롤높이값
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
        pos_x: 0 // 메뉴에 포함된 장바구니의 위치값
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        wx.setStorageSync('callMenuUrl', 'type')
        util.setEnableShareWechat()
        const menuHeight = app.globalData.deviceInfo.model.search('iPhone X') !== -1 ? 81 : 56 // 메뉴 높이 구하기
        const pages = getCurrentPages()
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')

        if (elementNavigation[0] !== null) {
            this.setData({
                heightNavigation: elementNavigation[0].height
            })
        }

        this.setData({
            pageLoading: true,
            isBackStatus: pages.length > 1 ? true : false, // 페지히스토리가 없으면 네비게이션에서 뒤로가기 버튼 숨기기
            contentPos: this.data.heightNavigation + 155,
            contentInnerHeight: app.globalData.deviceInfo.windowHeight - this.data.heightNavigation - 155 - menuHeight, // 소분류메뉴와 상품별콘텐트높이값 구하기
            pos_x: parseInt(app.globalData.deviceInfo.windowWidth / 5) * 3.4,
            isShowNoticeDialog: util.setCalcTimeNotice(define.START_DATE, define.END_DATE, util.formatDate(new Date(), '/'), wx.getStorageSync('notice_popup')) // 알림다이얼로그 로출설정값
        })

        // QR코드 스캔으로 들어오는 경우
        if (options.scene) {
            this.setData({
                typeId: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'id')),
                subTypeId: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'subid')),
                position: parseInt(util.getQueryString(decodeURIComponent(options.scene), 'position'))
            })
        } else {
            this.setData({
                typeId: options.id === undefined ? 0 : parseInt(options.id),
                subTypeId: options.subid === undefined ? 0 : parseInt(options.subid),
                position: options.position === undefined ? 0 : parseInt(options.position)
            })
        }

        this.setAnimationTypeLine()
        this.getTypeData()
        this.getRecommendData('first')
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
            title: this.data.subTypeName + ' - ' + this.data.typeName,
            path: '/pages/category/category_detail?id=' + this.data.typeId + '&subid=' + this.data.subTypeId + '&position=' + this.data.position
        }
    },
    onShareTimeline: function () {
        return {
            title: this.data.subTypeName + ' - ' + this.data.typeName,
            query: {
                key: '/pages/category/category_detail?id=' + this.data.typeId + '&subid=' + this.data.subTypeId + '&position=' + this.data.position
            },
            imageUrl: this.data.typeData[this.data.position].iconUri
        }
    },
    /**
     * Called when scroll move
     */
    onPageScroll: function (e) {},
    // 대분류 얻기
    getTypeData: function () {
        api.request('types').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        typeData: response.data,
                        swiperCount: app.globalData.deviceInfo.windowWidth >= 70 * response.data.length ? response.data.length : parseInt(app.globalData.deviceInfo.windowWidth / 70),
                        typeId: response.data[this.data.position].id,
                        typeName: response.data[this.data.position].typeName
                    })
                    // 선택된 대분류에 따라 스와이프아이템의 위치를 이동시키기
                    this.setData({
                        currentPos: this.data.position + 1 - this.data.swiperCount < 0 ? 0 : this.data.position + 1 - this.data.swiperCount
                    })

                    if (this.typeCallback) {
                        this.typeCallback()
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
        })
    },
    // 소분류 얻기
    getSubTypeData: function (status) {
        api.request(`types/${this.data.typeId}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        subTypeData: response.data
                    })

                    if (status === 'first' && this.data.isRecommend && this.data.subTypeId === 0) {
                        // 페지 첫 실행, 대분류선택, 추천분류가 존재하면 소분류명 정의
                        this.setData({
                            subTypeName: '推荐'
                        })
                    } else if (this.data.subTypeId !== 0 && status === 'first') {
                        // 페지 첫 실행이면서 소분류아이디가 존재하면 해당 소분류아이디에 따르는 소분류명 정의
                        if (response.data !== null) {
                            response.data.filter((res) => {
                                if (res.id === this.data.subTypeId) {
                                    this.setData({
                                        subTypeName: res.name
                                    })
                                }
                            })
                        }
                    } else {
                        // 페지 첫 실행이 아니고 추천분류가 아니면 첫번째소분류를 얻는다.
                        this.setData({
                            subTypeId: response.data.length !== 0 ? response.data[0].id : 0,
                            subTypeName: response.data.length !== 0 ? response.data[0].name : ''
                        })
                    }

                    // 소분류아이디가 0이 아니면 해당 소분류상품 얻기
                    if (this.data.subTypeId !== 0) {
                        this.setData({
                            tempGoodsData: []
                        })
                        this.getGoodsData('0', '', this.data.subTypeId)
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
        })
    },
    // 추천분류의 상품 얻기
    getRecommendData: function (status) {
        if (this.data.typeId === 0) {
            // 페지 첫 호출 시 대분류아이디가 0으로 되는 문제를 해결하기 위해 콜백처리 진행
            this.typeCallback = () => {
                this.getGoodsData('1', status, this.data.typeId)
            }
        } else {
            this.getGoodsData('1', status, this.data.typeId)
        }
    },
    // 분류에 따르는 상품 얻기
    getGoodsData: function (recomindex, status, id) {
        const query = {
            page: this.data.page,
            size: this.data.size
        }

        api.request(`types/${id}/${recomindex}`, query).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        totalNum: response.data.totalNum,
                        page: response.data.page,
                        size: response.data.size,
                        totalPage: response.data.totalNum % response.data.size === 0 ? response.data.totalNum / response.data.size : parseInt(response.data.totalNum / response.data.size) + 1
                    })

                    if (response.data.list !== null) {
                        response.data.list.filter((res) => {
                            this.data.tempGoodsData.push(res)
                        })

                        this.setData({
                            goodsData: this.data.tempGoodsData
                        })
                    }

                    // 페지 첫 실행이거나 대분류별 선택이라면 소분류를 생성한다.
                    if (status === 'first') {
                        this.setData({
                            isRecommend: response.data.list.length !== 0 ? true : false
                        })
                        this.getSubTypeData(status)
                    }

                    this.setData({
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
    },
    // 대분류 선택
    setType: function (e) {
        if (e.currentTarget.dataset.typeid === this.data.typeId) {
            return
        }

        this.setData({
            typeId: parseInt(e.currentTarget.dataset.typeid),
            typeName: e.currentTarget.dataset.typename,
            position: e.currentTarget.dataset.position,
            subTypeId: 0,
            page: 1,
            tempGoodsData: [],
            isMoreText: false,
            scrollTop: 0,
            pageLoading: true
        })
        this.setAnimationTypeLine()
        this.getRecommendData('first')
    },
    // 소분류 선택
    setSubType: function (e) {
        if (e.currentTarget.dataset.subtypeid === this.data.subTypeId) {
            return
        }

        this.setData({
            subTypeId: parseInt(e.currentTarget.dataset.subtypeid),
            subTypeName: e.currentTarget.dataset.subtypename,
            page: 1,
            tempGoodsData: [],
            isMoreText: false,
            scrollTop: 0,
            pageLoading: true
        })

        // 소분류아이디가 0이면 추천상품 얻기
        if (this.data.subTypeId === 0) {
            this.getRecommendData('')
        } else {
            this.getGoodsData('0', '', this.data.subTypeId)
        }
    },
    // 대분류 빨간테두리애니메이션 설정
    setAnimationTypeLine: function () {
        const animate = wx.createAnimation({
            duration: 230,
            timingFunction: 'ease-out'
        })

        util.getElementValue('.type-line-active', () => {
            if (this.data.tempPosTypeLine < 70 * this.data.position) {
                animate.translateX(70 * this.data.position + 10).step()
            } else {
                animate.translateX(70 * this.data.position - 10).step()
            }

            animate.translateX(70 * this.data.position + 1).step()

            this.setData({
                animateTypeLine: animate.export(),
                tempPosTypeLine: 70 * this.data.position
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
                tempGoodsData: [],
                cartCount: wx.getStorageSync('cart_count') === '' ? 0 : parseInt(wx.getStorageSync('cart_count'))
            })

            if (this.data.subTypeId === 0) {
                this.getRecommendData('') // 추천분류상품
            } else {
                this.getGoodsData('0', '', this.data.subTypeId) // 일반분류상품
            }
        }
    },
    // 볼컴포넨트에서 설정된 값으로 초기화(볼애니메이션 완료 알리기)
    endBallEvent: function (e) {
        this.setData({
            balls: e.detail
        })
    },
    // 스크롤위치가 맨 밑으로 왔을 경우 처리
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
                if (this.data.subTypeId === 0) {
                    this.getRecommendData('') // 추천분류상품
                } else {
                    this.getGoodsData('0', '', this.data.subTypeId) // 일반분류상품
                }

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
