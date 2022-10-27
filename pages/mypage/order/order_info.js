// pages/mypage/order/order_info.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        loadingMore: false,
        navTitle: '我的订单', // 네비게이션 타이틀
        heightNavigation: 0, // 네비게이션높이값
        heightTop: 0, // 톱뷰의 높이
        pageIndex: '', // 메뉴종류에 따르는 페지식별값
        isShowOrderLimitTime: false, // 결제대기시간 로출여부
        allOrderCnt: 0, // 전체주문수
        prePayOrderCnt: 0, // 결제전주문수
        preDeliveryOrderCnt: 0, // 배송대기주문수
        preReceiveOrderCnt: 0, // 수화대기주문수
        isEmptyOrder: false, // 주문데이터 존재여부
        orderId: 0, // 주문아이디
        orderNumber: '', // 주문번호
        orderData: [], // 주문 배렬
        phoneBound: '', // 앱에 바운딩된 폰번호
        phone: '', // 바운딩을 할 폰번호
        authCode: '', // 인증코드
        interval: 0, // 인증코드받는 대기시간계수값
        second: 60, // 인증코드받는 대기시간
        isShowPhoneBound: false, // 폰번호인증다이얼로그 로출상태
        isSubmitCode: false, // 인증코드요청상태
        resAuthCode: '', // 전송받은 인증코드
        isShowOverlay: false, // 백그라운드 오버레이 로출상태
        isShowSheet: false, // 메뉴툴로출여부
        animateSetting: null, // 메뉴애니메이션
        isScroll: false, // 스크롤진행여부
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        isDeviceHeight: app.globalData.isDeviceHeight,
        isShowToast: false, // 커스텀 토스트로출여부
        toastMessage: '', // 토스트메세지내용
        isShowDeliveryTool: false, // 배송번호에 의한 배송상태확인툴 로출상태
        deliveryData: [], // 주문에 따르는 배송정보배렬
        warningBtn: [],
        warningTitle: '', // 경고텍스트제목
        warningContent: '', // 경고텍스트내용
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningKind: '', // 경고다이얼로그 종류
        isClicked: false, // 중복클릭방지상태값
        totalNum: 0, // 총 주문수
        totalPage: 1, // 총 페지수
        page: 1, // 페지수
        size: 10, // 표시되는 주문수
        tempOrderData: [], // 림시주문데이터배렬
        tempOrderPos: 0,
        isOrderCancel: false
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        util.setDisableShareWechat()
        wx.removeStorageSync('pageCount')
        this.setData({
            pageIndex: options.index
        })
        util.setDisableShareWechat()
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')
        if (elementNavigation[0] !== null) {
            this.setData({
                heightNavigation: elementNavigation[0].height
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
        // 주문상세로 들어가지 않고 페지를 숨기기 했을 때 데이터 초기화
        if (wx.getStorageSync('pageCount') === '') {
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            })

            this.setData({
                page: 1,
                tempOrderData: []
            })
        }

        // 주문상품의 초기의 배렬위치값 얻기(주문상세에서 뒤로가기를 했을 때 변경된 주문상품이 속한 배렬만 다시 로딩하기 위함)
        this.data.tempOrderData.filter((res) => {
            if (parseInt(res.page) === parseInt(wx.getStorageSync('pageCount'))) {
                if (res.pos) {
                    this.setData({
                        tempOrderPos: res.pos // 다시 서버에서 얻어야 할 배렬의 위치값 얻기
                    })
                }
            }
        })

        this.setData({
            tempOrderData: this.data.tempOrderData.filter((res) => parseInt(res.page) !== parseInt(wx.getStorageSync('pageCount'))) // 다시 서버에서 얻어야 할 주문정보를 해당 배렬에서 제외하기
        })

        this.checkRunTimeMarket()
        this.getProfileData()
        this.getOrderNumber()
        this.getOrderData()
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
                this.getOrderData()
                this.setData({
                    loadingMore: false
                })
            }, 1000)
        }
    },

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
    // 서시장 운영시간 체크
    checkRunTimeMarket: async function () {
        const startTime = wx.getStorageSync('siteinfo').beginTime // 서시장 운영시작시간
        const endTime = wx.getStorageSync('siteinfo').endTime.split(':') // 서시장 운영마감시간
        const timeDelta = wx.getStorageSync('siteinfo').timeDelta // 운영시간 허용오차(마감시간 X시간전)
        const today = new Date() // 현재의 날자
        const todayDate = util.formatDate(today, '/') // 현재의 년,월,일
        const compareStartTime = new Date(todayDate + ' ' + startTime) // 서시장 운영시작시간 밀리초단위
        const compareEndTime = new Date(todayDate + ' ' + (parseInt(endTime[0]) - parseInt(timeDelta)) + ':' + endTime[1]) // 서시장 마감시간 밀리초단위

        if (today < compareStartTime || today >= compareEndTime) {
            // 현재의 시간이 서시장 운영시작시간보다 작거나 운영마감시간과 같거나 크다면 알림 띄우기
            this.setData({
                isShowOrderLimitTime: true
            })
        }

        // 톱뷰 높이구하기
        const elementTop = await util.getElementProperties('.top-content')

        if (elementTop[0] !== null) {
            this.setData({
                heightTop: elementTop[0].height
            })
        }
    },
    // 주문종류아이템 선택
    setViewItem: function (e) {
        if (e.currentTarget.dataset.item !== this.data.pageIndex) {
            wx.pageScrollTo({
                scrollTop: 0,
                duration: 0
            })

            this.setData({
                pageLoading: true,
                pageIndex: e.currentTarget.dataset.item,
                page: 1,
                tempOrderData: []
            })
            this.getOrderData()
        }
    },
    // 사용자프로필정보 얻기
    getProfileData: function () {
        api.request('profile').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        phoneBound: response.data.phone
                    })
                }
            }
        })
    },
    // 주문상태에 따르는 주문개수 얻기
    getOrderNumber: function () {
        this.setData({
            allOrderCnt: 0,
            prePayOrderCnt: 0,
            preDeliveryOrderCnt: 0,
            preReceiveOrderCnt: 0
        })

        api.request('orders/num').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    response.data.filter((res) => {
                        this.data.allOrderCnt += parseInt(res.num)

                        // 결제전주문수
                        if (res.status === 1) {
                            this.setData({
                                prePayOrderCnt: res.num
                            })
                        }

                        // 배송대기주문수
                        if (res.status === 2) {
                            this.setData({
                                preDeliveryOrderCnt: res.num
                            })
                        }
                        // 수화대기주문수
                        if (res.status === 3) {
                            this.setData({
                                preReceiveOrderCnt: res.num
                            })
                        }
                    })

                    this.setData({
                        pageLoading: false,
                        allOrderCnt: this.data.allOrderCnt
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
    // 주문 정보 얻기
    getOrderData: function () {
        let existPage = ''
        let pageCount = 0 // 주문상세페지에서 뒤로가기를 했을 때 다시 얻어야 할 페지수 설정

        if (this.data.isOrderCancel) {
            pageCount = this.data.tempOrderPos
        } else {
            pageCount = wx.getStorageSync('pageCount') !== '' ? wx.getStorageSync('pageCount') : this.data.page
        }

        api.request('orders?status=' + this.data.pageIndex + '&page=' + pageCount + '&size=' + this.data.size).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    if (response.data.list.length === 0 && this.data.pageIndex !== '') {
                        this.setData({
                            tempOrderData: []
                        })
                    }

                    const icons = wx.getStorageSync('siteinfo').goodsIconBeans
                    response.data.list.filter((res) => {
                        res.shops.filter((shop) => {
                            shop.goods.filter((prod) => {
                                icons.filter((icon) => {
                                    if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                        prod.goodsIconUrl = icon.iconUri
                                    }
                                })
                            })
                        })
                        // 해당 상품이 속한 페지수 추가
                        res.page = pageCount
                    })

                    // 마이페지에서 들어왔을 때 정상적으로 데이터 추가
                    if (wx.getStorageSync('pageCount') === '') {
                        // 주문취소인 경우 배렬설정을 진행
                        if (this.data.isOrderCancel) {
                            let pos = 0
                            // 주문상품의 초기의 배렬위치값 얻기(주문상세에서 뒤로가기를 했을 때 변경된 주문상품이 속한 배렬만 다시 로딩하기 위함)
                            this.data.tempOrderData.filter((res) => {
                                if (parseInt(res.page) === parseInt(pageCount)) {
                                    if (res.pos) {
                                        pos = res.pos
                                    }
                                }
                            })
                            this.setData({
                                tempOrderData: this.data.tempOrderData.filter((res) => parseInt(res.page) !== parseInt(pageCount)) // 다시 서버에서 얻어야 할 주문정보를 해당 배렬에서 제외하기
                            })
                            // 주문상세에서 뒤로가기를 했을 때 해당 주문상품이 속한 배렬을 원래의 배렬위치에 추가하기
                            response.data.list.filter((res, index) => {
                                this.data.tempOrderData.splice(parseInt(pos) + index, 0, res)
                            })
                        } else {
                            response.data.list.filter((res) => {
                                this.data.tempOrderData.push(res)
                            })
                        }
                    } else {
                        // 주문상세에서 뒤로가기를 했을 때 해당 주문상품이 속한 배렬을 원래의 배렬위치에 추가하기
                        response.data.list.filter((res, index) => {
                            this.data.tempOrderData.splice(parseInt(this.data.tempOrderPos) + index, 0, res)
                        })
                    }

                    // 해당 주문상품이 속한 페지만 얻기 위해 배렬의 위치를 얻기
                    this.data.tempOrderData.filter((res, index) => {
                        if (existPage.search(res.page) === -1) {
                            res.pos = index
                            existPage += res.page + ','
                        }
                    })

                    this.setData({
                        pageLoading: false,
                        isOrderCancel: false,
                        orderData: this.data.tempOrderData,
                        isEmptyOrder: response.data.list.length === 0,
                        totalPage: response.data.totalNum % response.data.size === 0 ? parseInt(response.data.totalNum / response.data.size) : parseInt(response.data.totalNum / response.data.size) + 1
                    })
                    wx.removeStorageSync('pageCount')
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
    // 배송번호정보 얻기
    deliveryInfo: function (e) {
        this.setData({
            orderId: e.detail.orderid,
            orderNumber: e.detail.ordernumber
        })

        api.request(`orders/deliveries/${this.data.orderNumber}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    if (response.data.length !== 0) {
                        let existStr = ''
                        let tmpData = []

                        response.data.filter((res) => {
                            if (existStr.slice(0, existStr.length - 1).search(res.deliveryCompanyName) === -1) {
                                tmpData.push(res)
                                existStr += res.deliveryCompanyName + ','
                            }
                        })

                        this.setData({
                            deliveryData: tmpData
                        })

                        if (response.data.length > 1) {
                            this.setData({
                                isShowOverlay: true,
                                isShowDeliveryTool: true
                            })
                        } else {
                            wx.navigateTo({
                                url: '/delivery/pages/delivery_status/delivery_status?orderid=' + this.data.orderId + '&deliveryno=' + response.data[0].deliveryNo + '&orderno=' + response.data[0].orderNo
                            })
                        }
                    }
                }
            }
        })
    },
    // 주문취소하기
    setCancelOrder: function (e) {
        this.setData({
            orderId: e.detail,
            warningKind: 'cancel_order'
        })

        this.setShowWarningDialog('是否要取消订单?', '', 'two', '否', '是')
    },
    cancelOrder: function () {
        this.setData({
            pageLoading: true
        })
        api.request(`orders/cancel/${this.data.orderId}`, {}, 'PUT').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.data.tempOrderData.filter((res) => {
                        if (res.id === this.data.orderId) {
                            this.setData({
                                isOrderCancel: true,
                                tempOrderPos: res.page
                            })
                        }
                    })
                    this.getOrderNumber()
                    this.getOrderData()
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
    // 환불하기
    setRefundOrder: function (e) {
        this.setData({
            orderId: e.detail,
            warningKind: 'refund_order'
        })

        this.setShowWarningDialog('确定要退款吗?', '', 'two', '否', '是')
    },
    refundOrder: function () {
        this.setData({
            pageLoading: true
        })

        api.request(`orders/refund/${this.data.orderId}`, {}, 'PUT').then((response) => {
            if (response.action) {
                if (response.code === 0) {
                    this.setData({
                        isShowToast: true,
                        toastMessage: '退款成功！',
                        pageLoading: false
                    })

                    this.getOrderNumber()
                    this.getOrderData()
                } else {
                    this.setData({
                        isShowToast: true,
                        toastMessage: response.msg,
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
    // 주문결제하기
    setPayOrder: function (e) {
        if (this.data.isClicked) {
            return
        }

        // 앱에 사용자의 폰이 바운딩 안되어있으면 폰바운딩 팝업 로출
        if (this.data.phoneBound.trim() === '') {
            this.setShowPhoneAuthDialog()
            return
        }

        this.setData({
            orderId: e.detail.orderid,
            orderNumber: e.detail.ordernumber,
            pageLoading: true
        })
        api.request(`orders/${this.data.orderId}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.checkRunTimeMarket()
                    // 배달이면서 시장마감시간이 지났으면 결제여부 팝업 로출
                    if (response.data.deliveryType === 3 && this.data.isShowOrderLimitTime) {
                        this.setData({
                            pageLoading: false
                        })
                        this.setShowWarningDialog('同城市场配送时间<br>（' + wx.getStorageSync('siteinfo').beginTime + '~' + wx.getStorageSync('siteinfo').endTime + ')', '', 'one', '确认', '')
                        return
                    }
                    // 택배이면서 시장마감시간이 지났으면 결제여부 팝업 로출
                    if (response.data.deliveryType !== 3 && response.data.deliveryType !== 4 && this.data.isShowOrderLimitTime) {
                        this.setData({
                            pageLoading: false,
                            warningKind: 'pay_order'
                        })
                        this.setShowWarningDialog('当前为西市场非营业时间<br>是否同意下一个工作日安排派送？', '', 'two', '放弃下单', '继续下单')
                        return
                    }

                    this.setPayWechat()
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
    // 위챗 결제
    setPayWechat: function () {
        this.setData({
            pageLoading: true,
            isClicked: true
        })
        api.request('toWxPay/mini?orderNo=' + this.data.orderNumber, {}, 'GET', 'pay').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    wx.requestPayment({
                        timeStamp: response.data.timeStamp.toString(),
                        nonceStr: response.data.nonceStr,
                        package: 'prepay_id=' + response.data.prepayId,
                        signType: response.data.signType,
                        paySign: response.data.paySign,
                        success: (res) => {
                            this.setData({
                                pageLoading: false,
                                isClicked: false
                            })
                            wx.reLaunch({
                                url: '/pages/goods/order_complete/order_complete?orderno=' + this.data.orderNumber + '&orderid=' + this.data.orderId
                            })
                        },
                        fail: (err) => {
                            this.setData({
                                warningKind: 'pay',
                                pageLoading: false,
                                isShowToast: true,
                                toastMessage: err.errMsg === 'requestPayment:fail cancel' ? '取消支付' : '支付失败',
                                isClicked: false
                            })

                            return
                        }
                    })
                } else {
                    this.setData({
                        pageLoading: false,
                        isShowToast: true,
                        toastMessage: '支付失败',
                        isClicked: false
                    })
                }
            } else {
                this.setData({
                    pageLoading: false,
                    isShowToast: true,
                    toastMessage: '支付失败',
                    isClicked: false
                })
            }
        })
    },
    // 문자렬 입력시 이벤트
    setInputValue: function (e) {
        if (e.currentTarget.dataset.kind === 'phone') {
            this.setData({
                phone: e.detail.value
            })
        }

        if (e.currentTarget.dataset.kind === 'auth') {
            this.setData({
                authCode: e.detail.value
            })
        }
    },
    // 폰번호에 의한 인증번호 요청
    setSendCode: function (e) {
        this.setData({
            pageLoading: true
        })

        api.request(`smsAuth?phoneNum=${this.data.phone}`, {}, 'POST').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        interval: setInterval(this.countTime, 1000),
                        isSubmitCode: true,
                        resAuthCode: response.data.value,
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
    // 폰번호 프로필에 업데이트
    setUpdatePhoneInfo: function (e) {
        // 인증번호가 틀린 경우
        if (this.data.resAuthCode !== this.data.authCode) {
            this.setData({
                isShowToast: true,
                toastMessage: '验证失败'
            })
            return
        }

        this.setData({
            pageLoading: true
        })
        api.request(`smsAuth?phoneNum=${this.data.phone}&authCode=${this.data.authCode}`, {}, 'PUT').then((response) => {
            if (response.action) {
                clearInterval(this.data.interval)
                this.setData({
                    pageLoading: false,
                    isSubmitCode: false,
                    isShowPhoneBound: false,
                    isShowWarningDialog: false,
                    isShowOverlay: false,
                    phoneBound: this.data.phone
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 인증번호받는 대기시간 계수
    countTime() {
        this.data.second--
        this.setData({
            second: this.data.second
        })

        if (this.data.second <= 0) {
            clearInterval(this.data.interval)
            this.setData({
                authCode: '',
                second: 60,
                isSubmitCode: false
            })
            return
        }
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
                wx.redirectTo({
                    url: '/pages/mypage/order/receive/receive'
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    setShowPhoneAuthDialog: function () {
        this.setData({
            isShowPhoneBound: true,
            isShowOverlay: true,
            phone: '',
            authCode: '',
            isSubmitCode: false
        })
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
    },
    // 백그라운드 오버레이 숨기기 설정
    setHideOverlay: function () {
        this.setData({
            isShowOverlay: false,
            isShowDeliveryTool: false,
            isShowPhoneBound: false
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

        if (this.data.warningKind === 'cancel_order') {
            if (e.detail.index === 1) {
                this.cancelOrder()
            }
        }

        if (this.data.warningKind === 'pay_order') {
            if (e.detail.index === 1) {
                this.setPayWechat()
            }
        }

        if (this.data.warningKind === 'receive') {
            if (e.detail.index === 1) {
                this.setReceive()
            }
        }

        if (this.data.warningKind === 'refund_order') {
            if (e.detail.index === 1) {
                this.refundOrder()
            }
        }
    }
})
