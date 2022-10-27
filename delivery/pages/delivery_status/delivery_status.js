// pages/mypage/delivery/delivery_status/delivery_status.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '查看物流', // 네비게이션 타이틀
        orderId: 0, // 주문아이디
        orderNo: 0, // 주문번호
        deliveryNo: '', // 배송번호
        deliveryName: '', // 배송명
        address: '', // 배송주소
        tracks: [], // 배송상태 배렬
        isShowToast: false, // 커스텀 토스트로출여부
        warningBtn: [],
        warningTitle: '', // 경고텍스트제목
        warningContent: '', // 경고텍스트내용
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        isScroll: false, // 스크롤진행여부
        isShowOverlay: false, // 백그라운드 오버레이 로출상태
        isShowSheet: false, // 메뉴툴로출여부
        animateSetting: null, // 메뉴애니메이션
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        isDeviceHeight: app.globalData.isDeviceHeight
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()
        this.setData({
            orderId: options.orderid,
            orderNo: options.orderno,
            deliveryNo: options.deliveryno
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
        api.request(`orders/delivery/${this.data.orderNo}/${this.data.deliveryNo}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        deliveryName: response.data.deliveryName,
                        address: response.data.address,
                        tracks: response.data.tracks
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
    // 클립보드 복사
    setClipboard: function () {
        let that = this

        wx.setClipboardData({
            data: that.data.deliveryNo
        })
    },
    // 주문수거확인
    setReceiveOrder: function (e) {
        this.setData({
            orderId: e.detail,
            warningKind: 'receive'
        })

        this.setShowWarningDialog('是否要确认收货?', '', 'two', '否', '是')
    },
    setReceive: function () {
        this.setData({
            pageLoading: true
        })

        api.request(`orders/done/${this.data.orderId}`, {}, 'PUT').then((response) => {
            if (response.action) {
                this.setData({
                    pageLoading: false
                })
                wx.navigateTo({
                    url: '/pages/mypage/order/receive/receive'
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
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
            this.setReceive()
        }
    },
    endToast: function (e) {
        this.setData({
            isShowToast: false
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
    }
})
