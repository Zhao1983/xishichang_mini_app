// pages/mypage/order/order_detail/order_detail.js
const api = require('../../../../utils/request.js')
const util = require('../../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '', // 네비게이션 타이틀
        heightNavigation: 0, // 네비게이션높이값
        heightTop: 0, // 톱뷰의 높이
        isShowOrderLimitTime: false, // 결제대기시간 로출여부
        phoneBound: '', // 앱에 바운딩된 폰번호
        phone: '', // 바운딩을 할 폰번호
        authCode: '', // 인증코드
        intervalAuth: 0, // 인증코드받는 대기시간계수값
        interval: 0, // 주문취소시간계수값
        secondAuth: 60, // 인증코드받는 대기시간
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
        isShowHelp: false, // 배송상세정보 로출상태
        warningBtn: [],
        warningTitle: '', // 경고텍스트제목
        warningContent: '', // 경고텍스트내용
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningKind: '', // 경고다이얼로그 종류
        isClicked: false, // 중복클릭방지상태값
        orderId: 0, // 주문아이디
        userName: '', // 주문자명
        userPhone: '', // 주문자폰번호
        province: '', // 배송지 성명
        city: '', // 배송지 시명
        country: '', // 배송지 지역명
        address: '', // 배송지 상세주소
        houseNo: '', // 상세주소
        orderNo: '', // 주문번호
        payNo: '', // 결제번호
        createDt: '', // 주문날자
        expireDt: '', // 미결제일 때 주문취소되는 시간
        cancelDt: '', // 주문취소날자
        doneDt: '', // 주문완료날자
        refundDt: '', // 환불날자
        deliveryDt: '', // 배송날자
        deliveryType: 0, // 배송형태
        orderStatus: 0, // 주문상태
        orderPrice: 0, // 주문가격
        shopData: [], // 주문한 상품정보
        countDate: '00:00:00', // 주문마감시간
        selfTime: '', // 직접구매할 때 시장에서 주문물품 가져가는 시간
        basicPrice: 0, // 배송총기본배송가격
        totalGoodsWeight: 0, // 주문상품총무게
        totalStreet: 0, // 총배달거리
        packagePrice: 0, // 포장금액
        totalGoodsPrice: 0, // 총주문상품금액
        deliveries: [], // 배송정보배렬
        totalDeliveryPrice: 0, // 총배송비
        useDeliveryCompany: [], // 주문상품의 배송회사배렬

        overWeight: 0, // 초과무게
        overWeightPrice: 0, // 초과무게에 따르는 가격
        totalOverWeight: 0, // 초과된 총무게
        totalOverWeightPrice: 0, // 초과된 총무게에 따르는 가격
        overStreet: 0, // 초과거리
        overStreetPrice: 0, // 초과된 거리에 따르는 가격
        totalOverStreet: 0, // 초과된 총거리
        totalOverStreetPrice: 0, // 초과된 총거리에 따르는 가격

        livingAirDeliveryNames: '',
        livingAirDeliveryNumbers: '',
        livingAirDeliveryPhone: '',
        freshAirDeliveryNames: '',
        freshAirDeliveryNumbers: '',
        freshAirDeliveryPhone: '',
        normalDeliveryNames: '', // 정상배송일 때 배송회사명
        normalDeliveryNumbers: '', // 정상배송일 때 배송번호
        normalDeliveryPhone: '', // 배달일 때 배달자 폰번호
        normalDeliveryPrice: 0, // 정상배송일 때 배송가격
        airDeliveryPrice: 0
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        util.setDisableShareWechat()
        this.setData({
            orderId: options.orderid,
            pageLoading: true
        })

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
        this.checkRunTimeMarket()
        this.getProfileData()
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
        const elementTop = await util.getElementProperties('.warning')

        if (elementTop[0] !== null) {
            this.setData({
                heightTop: elementTop[0].height
            })
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
    // 주문상세 얻기
    getOrderData: function () {
        api.request(`orders/${this.data.orderId}`).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false
                    })

                    if (response.data.orderStatus === 1 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '待支付'
                        })
                    }

                    if (response.data.orderStatus === 2 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '待发货'
                        })
                    }

                    if (response.data.orderStatus === 3 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '待收货'
                        })
                    }

                    if (response.data.orderStatus === 4 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '已取消'
                        })
                    }

                    if (response.data.orderStatus === 5 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '已完成'
                        })
                    }

                    if (response.data.orderStatus === 6 && response.data.refundDt === '') {
                        this.setData({
                            navTitle: '部分发货'
                        })
                    }

                    if (response.data.refundDt !== '') {
                        this.setData({
                            navTitle: '已退款'
                        })
                    }

                    const icons = wx.getStorageSync('siteinfo').goodsIconBeans
                    let totalGoodsPrice = 0

                    response.data.shops.filter((shop) => {
                        shop.goods.filter((prod) => {
                            icons.filter((icon) => {
                                if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                    prod.goodsIconUrl = icon.iconUri
                                }
                            })

                            totalGoodsPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                        })
                    })

                    let tmpPackagePrice = 0
                    let tmpGoodsWeight = 0
                    let tmpDeliveryPrice = 0
                    let tmpDeliveryCompany = []

                    response.data.deliveries.filter((res) => {
                        tmpPackagePrice += res.packagePrice
                        tmpGoodsWeight += res.deliveryWeight
                        tmpDeliveryPrice += res.deliveryPrice

                        // 배달 혹은 직접 주문이 아니라면
                        if (response.data.deliveryType !== 3 && response.data.deliveryType !== 4) {
                            let key = -1

                            tmpDeliveryCompany.filter((value, index) => {
                                res.deliveryName.split(',').filter((val) => {
                                    if (value.name === val) {
                                        key = index
                                    }
                                })
                            })

                            if (key !== -1) {
                                tmpDeliveryCompany[key].price += res.deliveryPrice
                            } else {
                                res.deliveryName.split(',').filter((val, idx) => {
                                    const value = {
                                        name: val,
                                        price: res.deliveryPrice,
                                        no: res.deliveryNo.split(',')[idx],
                                        orderNo: res.orderNo
                                    }
                                    tmpDeliveryCompany.push(value)
                                })
                            }
                        }
                    })

                    this.setData({
                        userName: response.data.userName,
                        userPhone: response.data.userPhone,
                        province: response.data.province,
                        city: response.data.city,
                        country: response.data.country,
                        address: response.data.address,
                        houseNo: response.data.houseNo,
                        orderNo: response.data.orderNo,
                        payNo: response.data.payNo,
                        createDt: response.data.createDt,
                        expireDt: response.data.expireDt === null ? '' : new Date(response.data.expireDt.replace(/-/g, '/')),
                        cancelDt: response.data.cancelDt,
                        doneDt: response.data.doneDt,
                        refundDt: response.data.refundDt,
                        deliveryDt: response.data.deliveryDt,
                        deliveryType: response.data.deliveryType,
                        orderStatus: response.data.orderStatus,
                        orderPrice: response.data.orderPrice,
                        shopData: response.data.shops,
                        totalStreet: response.data.deliveryDistance,
                        totalGoodsPrice: totalGoodsPrice,
                        packagePrice: tmpPackagePrice,
                        totalGoodsWeight: tmpGoodsWeight,
                        totalDeliveryPrice: tmpDeliveryPrice,
                        useDeliveryCompany: tmpDeliveryCompany,
                        deliveries: response.data.deliveries
                    })

                    // 미지불이면 지불대기시간 카운팅
                    if (response.data.orderStatus === 1 && response.data.expireDt !== null) {
                        this.setData({
                            interval: setInterval(this.countTime, 1000)
                        })
                    }

                    // 직접주문이면 도착시간 로출
                    if (response.data.deliveryType === 4) {
                        const temp = response.data.deliveryDt.split(' ')[1]
                        this.setData({
                            selfTime: temp.split(':')[0] + ':' + temp.split(':')[1]
                        })
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
    countTime() {
        const second = 1000
        const minute = second * 60
        const hour = minute * 60
        const day = hour * 24

        const nowTime = new Date()
        const expireDate = this.data.expireDt.getTime() - nowTime.getTime()

        if (this.data.expireDt - nowTime <= 0) {
            clearInterval(this.data.interval)
            this.setData({
                countDate: '00:00:00'
            })
            this.cancelOrder()
        } else {
            const days = Math.floor(expireDate / day)
            const hours = Math.floor((expireDate % day) / hour)
            const minutes = Math.floor((expireDate % hour) / minute)
            const seconds = Math.floor((expireDate % minute) / second)

            this.setData({
                countDate: util.numberPad(hours, 2) + ':' + util.numberPad(minutes, 2) + ':' + util.numberPad(seconds, 2)
            })
        }
    },
    // 인증번호받는 대기시간 계수
    countTimeAuth() {
        this.data.secondAuth--

        this.setData({
            secondAuth: this.data.secondAuth
        })

        if (this.data.secondAuth <= 0) {
            clearInterval(this.data.intervalAuth)
            this.setData({
                authCode: '',
                secondAuth: 60,
                isSubmitCode: false
            })

            return
        }
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
                        intervalAuth: setInterval(this.countTimeAuth, 1000),
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
                clearInterval(this.data.intervalAuth)
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
    // 주문취소하기
    setCancelOrder: function (e) {
        this.setData({
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
                    this.setData({
                        pageLoading: false
                    })

                    wx.navigateBack({
                        delta: 1,
                        fail() {
                            wx.reLaunch({
                                url: '/pages/mypage/order/order_info?index='
                            })
                        }
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
    // 환불하기
    setRefundOrder: function (e) {
        this.setData({
            warningKind: 'refund_order'
        })

        this.setShowWarningDialog('确定要退款吗?', '', 'two', '否', '是')
    },
    refundOrder: function () {
        this.setData({
            pageLoading: true
        })

        api.request(`orders/refund/${this.data.orderId}`, {}, 'PUT').then((response) => {
            console.log(response)
            if (response.action) {
                if (response.code === 0) {
                    this.setData({
                        isShowToast: true,
                        toastMessage: '退款成功！',
                        pageLoading: false
                    })

                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                            fail() {
                                wx.reLaunch({
                                    url: '/pages/mypage/order/order_info?index='
                                })
                            }
                        })
                    }, 2100)
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

        this.checkRunTimeMarket()

        // 배달이면서 시장마감시간이 지났으면 결제여부 팝업 로출
        if (this.data.deliveryType === 3 && this.data.isShowOrderLimitTime) {
            this.setShowWarningDialog('同城市场配送时间<br>（' + wx.getStorageSync('siteinfo').beginTime + '~' + wx.getStorageSync('siteinfo').endTime + ')', '', 'one', '确认', '')
            return
        }

        // 택배이면서 시장마감시간이 지났으면 결제여부 팝업 로출
        if (this.data.deliveryType !== 3 && this.data.deliveryType !== 4 && this.data.isShowOrderLimitTime) {
            this.setData({
                warningKind: 'pay_order'
            })
            this.setShowWarningDialog('当前为西市场非营业时间<br>是否同意下一个工作日安排派送？', '', 'two', '放弃下单', '继续下单')
            return
        }

        this.setPayWechat()
    },
    // 위챗 결제
    setPayWechat: function () {
        this.setData({
            isClicked: true,
            pageLoading: true
        })

        api.request('toWxPay/mini?orderNo=' + this.data.orderNo, {}, 'GET', 'pay').then((response) => {
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
                                url: '/pages/goods/order_complete/order_complete?orderno=' + this.data.orderNo + '&orderid=' + this.data.orderId
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
    // 배송번호정보 얻기
    deliveryInfo: function (e) {
        if (this.data.useDeliveryCompany.length === 1) {
            wx.navigateTo({
                url: '/delivery/pages/delivery_status/delivery_status?orderid=' + this.data.orderId + '&deliveryno=' + this.data.useDeliveryCompany[0].no + '&orderno=' + this.data.useDeliveryCompany[0].orderNo
            })
            return
        }

        this.setData({
            isShowOverlay: true,
            isShowDeliveryTool: true
        })
    },
    // 주문수거확인
    setReceiveOrder: function (e) {
        this.setData({
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
            isShowPhoneBound: false,
            isShowHelp: false
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
    },
    // 배송정보툴 로출
    setShowHelp: function (e) {
        this.setData({
            isShowHelp: true,
            isShowOverlay: true,
            basicPrice: this.data.deliveries[0].deliveryPrice
        })
    },
    // 클립보드 복사
    setClipboard: function (e) {
        wx.setClipboardData({
            data: e.currentTarget.dataset.value
        })
    },
    // 전화호출
    makePhoneCall: function (e) {
        wx.makePhoneCall({
            phoneNumber: e.currentTarget.dataset.value,
            success() {}
        })
    }
})
