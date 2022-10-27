// pages/mypage/delivery/delivery.js
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        isShowToast: false, // 커스텀 토스트로출여부
        toastMessage: '', // 토스트메세지내용
        navTitle: '收货地址', // 네비게이션 타이틀
        isEmpty: false, // 주소존재상태
        isShowOverlay: false, // 백그라운드 오버레이 로출상태
        isShowSheet: false, // 메뉴툴로출여부
        animateSetting: null, // 메뉴애니메이션
        isScroll: false, // 스크롤진행여부
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        warningBtn: [],
        warningTitle: '', // 경고텍스트제목
        warningContent: '', // 경고텍스트내용
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningKind: '', // 경고다이얼로그 종류
        deliveryId: 0, // 배송지아이디
        deliveryData: [], // 배송지 배렬
        param: '',
        price: '',
        weight: ''
    },
    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()
        this.setData({
            param: options.param ? options.param : '',
            price: options.price ? options.price : '',
            weight: options.weight ? options.weight : ''
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
        this.getDeliveryData()
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
    onPageScroll: function () {
        this.setData({
            isScroll: true
        })
    },
    // 배송정보 얻기
    getDeliveryData: function () {
        this.setData({
            pageLoading: true
        })

        api.request('delivery').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        deliveryData: response.data,
                        isEmpty: response.data.length === 0 ? true : false
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
    // 배송지 삭제
    setDeleteAddress: function (e) {
        this.setData({
            deliveryId: e.currentTarget.dataset.id
        })
        this.setShowWarningDialog('确定要删除该地址吗？', '', 'two', '否', '是')
    },
    deleteAddress: function () {
        this.setData({
            pageLoading: true
        })

        if (this.data.deliveryData.length > 1) {
            api.request(`delivery/${this.data.deliveryId}`, {}, 'DELETE').then((response) => {
                if (response.action) {
                    this.getDeliveryData()
                } else {
                    this.setData({
                        pageLoading: false
                    })
                }
            })
        } else {
            this.setData({
                pageLoading: false,
                isShowToast: true,
                toastMessage: '该地址不能删除，只需编辑！'
            })
        }
    },
    // 배송지주소 변경
    setChangeAddress: function (e) {
        if (this.data.param !== '') {
            wx.setStorageSync('deliveryid', e.currentTarget.dataset.id)

            if (this.data.price !== '') {
                wx.redirectTo({
                    url: '/pages/goods/order/order?param=' + this.data.param + '&price=' + this.data.price + '&weight=' + this.data.weight
                })
            } else {
                wx.navigateBack({
                    delta: 1
                })
            }
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
    // 메뉴설정 아이콘 애니메이션 설정
    setAnimateIcons: function () {
        const animate = wx.createAnimation({
            duration: 300,
            timingFunction: 'linear'
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
    // 백그라운드 오버레이 숨기기 설정
    setHideOverlay: function () {
        this.setData({
            isShowOverlay: false
        })
    },
    // 경고다이얼로그 로출설정
    setShowWarningDialog: function (title, content, kind, btn_txt1, btn_txt2) {
        this.setData({
            isShowWarningDialog: true,
            warningTitle: title,
            warningContent: content,
            warningBtn: kind === 'one' ? [{ text: btn_txt1 }] : [{ text: btn_txt1 }, { text: btn_txt2 }]
        })
    },
    // 경고다이얼로그 액션처리
    setConfirmWarningDialog: function (e) {
        this.setData({
            isShowWarningDialog: false
        })

        if (e.detail.index === 1) {
            this.deleteAddress()
        }
    },
    endToast: function (e) {
        this.setData({
            isShowToast: false
        })
    }
})
