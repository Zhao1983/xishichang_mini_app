// pages/goods/order/order.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '提交订单', // 네비게이션 타이틀
        paramCart: '', // 장바구니에서 넘어오는 파라메터
        isShowToast: false, // 커스텀 토스트로출여부
        toastMessage: '', // 토스트메세지내용
        deliveryId: wx.getStorageSync('deliveryid') === '' ? 0 : parseInt(wx.getStorageSync('deliveryid')), // 배송지아이디
        totalPrice: 0, // 주문총가격
        totalGoodsPrice: 0, // 주문상품총가격
        totalGoodsWeight: 0, // 주문상품총무게
        totalPackageWeight: 0, // 주문상품포장무게
        isOrderLimitTime: false, // 시장이 끝나는 시간 체크여부
        isTabKind: '0', // 주문방식선택여부(0: 배송, 1: 매장에서 직접 주문)
        warningBtn: [],
        warningTitle: '', // 경고텍스트제목
        warningContent: '', // 경고텍스트내용
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningKind: '', // 경고다이얼로그 종류
        airIds: [], // 항공편배송용 상품아이디 배렬
        cartItems: [], // 장바구니 배렬
        deliveryItems: [], // 택배배송회사에 따르는 주문상품배렬
        userName: '', // 사용자명
        userPhone: '', // 사용자폰번호
        provinceName: '', // 성
        cityName: '', // 시
        countryName: '', // 지역
        address: '', // 주소
        houseNo: '', // 상세주소
        packageNum: 0, // 포장수량
        packagePrice: 0, // 포장가격
        airPrice: 0, // 항공운비
        normalPrice: 0, // 정상운비
        type: '', // 배송형태
        doneDt: '', // 도착예정시간
        deliverySalesPrice: 0, // 배송비
        deliveryOriginPrice: 0, // 배송원가
        selfTime: [], // 매장에서 직접 구매하는 시간
        selfPhone: '', // 매장에서 직접 구매할 때 입력하는 폰번호
        isSelfAgree: false, // 매장구매여부
        isShowDeliveryInfo: false, // 택배배송일 때 구체적인 배송가격 로출 여부
        basicPrice: 0, // 배송총기본배송가격
        setTime: '', // 서시장에서 직접 구매할 때 주문 후 서시장 도착시간 설정값
        remark: '', // 고객의 첨부사항내용
        orderId: 0, // 주문아이디
        orderNumber: '', // 주문번호
        overWeight: 0, // 초과무게
        overWeightPrice: 0, // 초과무게에 따르는 가격
        totalOverWeight: 0, // 초과된 총무게
        totalOverWeightPrice: 0, // 초과된 총무게에 따르는 가격
        totalStreet: 0, // 총배달거리
        overStreet: 0, // 초과거리
        overStreetPrice: 0, // 초과된 거리에 따르는 가격
        totalOverStreet: 0, // 초과된 총거리
        totalOverStreetPrice: 0, // 초과된 총거리에 따르는 가격
        airWeight: 0, // 항공배송무게
        normalWeight: 0, // 일반배송무게
        initDistance: 0, // 첫 배달거리
        initWeight: 0, // 첫 배달무게
        distance: 0, // 총배달거리
        weight: 0, // 총배달무게
        phoneBound: '', // 앱에 바운딩된 폰번호
        phone: '', // 바운딩을 할 폰번호
        authCode: '', // 인증코드
        interval: 0, // 인증코드받는 대기시간계수값
        second: 60, // 인증코드받는 대기시간
        deliveryStatus: '', // 배송가능여부
        isLimitTime: false, // 시장이 끝나는 시간 체크여부
        isDeviceHeight: app.globalData.isDeviceHeight,
        isShowHelp: false, // 배송상세정보 로출상태
        isShowOverlay: false, // 백그라운드 오버레이 로출상태
        isShowPhoneBound: false, // 폰번호인증다이얼로그 로출상태
        isSubmitCode: false, // 인증코드요청상태
        resAuthCode: '', // 전송받은 인증코드
        isShowSelfTimeTool: false, // 서시장에서 직접 구매할수 있는 시간리스트 툴 로출상태
        isClicked: false, // 중복클릭방지상태값
        isShowSheet: false, // 메뉴툴로출여부
        animateSetting: null, // 메뉴애니메이션
        isScroll: false, // 스크롤진행여부
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        useDeliveryCompany: [], // 주문상품의 배송회사배렬
        totalDeliveryCompanyPrice: 0, // 배송회사배송비
        totalDeliveryCompanyOldPrice: 0,
        deliveryCompanies: [], // 택배배송회사배렬
        deliveryCompanyCode: '', // 택배배송회사코드
        deliveryCompanyIndex: 0, // 택배배송회사배렬인덱스값
        windowWidth: 0,
        isShowCompanyTool: false, // 택배배송회사선택툴 로출여부
        freeItems: [], // 무료배송상품배렬
        freePackageStatus: '0', // 무료포장상태여부
        freeShippingStatus: '0', // 무료배송상태여부
        freePackageNeededPrice: 0, // 무료포장기준필요가격
        freeShippingNeededPrice: 0, // 무료배송기준필요가격
        eventItems: null // 이벤트상품
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        wx.setStorageSync('callMenuUrl', 'order')
        util.setDisableShareWechat()
        this.setData({
            paramCart: options.param,
            totalGoodsPrice: options.price
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
        this.setData({
            deliveryId: wx.getStorageSync('deliveryid') === '' ? 0 : parseInt(wx.getStorageSync('deliveryid')),
            isShowDeliveryInfo: false
        })
        this.checkRunTimeMarket()
        this.getProfileData()
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
    // 서시장 운영시간 체크
    checkRunTimeMarket: function () {
        const startTime = wx.getStorageSync('siteinfo').beginTime // 서시장 운영시작시간
        const endTime = wx.getStorageSync('siteinfo').endTime.split(':') // 서시장 운영마감시간
        const timeDelta = wx.getStorageSync('siteinfo').timeDelta // 운영시간 허용오차(마감시간 X시간전)
        const today = new Date() // 현재의 날자
        const todayDate = util.formatDate(today, '/') // 현재의 년,월,일
        const compareStartTime = new Date(todayDate + ' ' + startTime) // 서시장 운영시작시간 밀리초단위
        const compareEndTime = new Date(todayDate + ' ' + (parseInt(endTime[0]) - parseInt(timeDelta)) + ':' + endTime[1]) // 서시장 마감시간 밀리초단위
        const selfMinuteBegin = parseInt(wx.getStorageSync('siteinfo').selfMinuteBegin) // 시장에서 직접 주문할 때의 시작시간 구간
        const selfMinuteInterval = parseInt(wx.getStorageSync('siteinfo').selfMinuteInterval) // 시장에서 직접 주문할 때의 시간선택구간
        const selfEndTime = wx.getStorageSync('siteinfo').selfEndTime // 시장 직접 주문 마감시간
        const compareEndSelfTime = new Date(todayDate + ' ' + selfEndTime + ':00')

        // 하루 24시간을 서버에서 내려오는 구간분단위로 분리하여 배렬에 저장한다.
        let tempTime = []

        // 20분단위로 분리되였을 때
        if (selfMinuteInterval === 20) {
            for (let i = 0; i < 24; i++) {
                let value = i + ':20'
                let value1 = i + ':40'
                let value2 = i + 1 + ':00'

                tempTime.push(value)
                tempTime.push(value1)
                tempTime.push(value2)
            }
        }

        // 30분단위로 분리되였을 때
        if (selfMinuteInterval === 30) {
            for (let i = 0; i < 24; i++) {
                let value = i + ':30'
                let value1 = i + 1 + ':00'

                tempTime.push(value)
                tempTime.push(value1)
            }
        }

        if (today < compareStartTime || today >= compareEndTime) {
            // 현재의 시간이 서시장 운영시작시간보다 작거나 운영마감시간과 같거나 크다면 알림 띄우기
            this.setData({
                isLimitTime: true
            })
        } else {
            // 서시장 운영시간내라면 직접 서시장에 와서 구매할 시간을 배렬에 저장한다.
            today.setMinutes(today.getMinutes() + selfMinuteBegin)
            let tmpArray = []

            for (let i = 0; i < tempTime.length; i++) {
                const tmpCompare = new Date(todayDate + ' ' + tempTime[i]) // 분단위로 분리한 시간을 밀리초단위로 변환

                // 분단위시간이 현재의 시간보다 큰값과 서시장 마감시간과 같거나 작은 구간을 배렬에 저장한다.
                if (tmpCompare >= today && tmpCompare <= compareEndSelfTime) {
                    tmpArray.push(tempTime[i])
                }
            }

            this.setData({
                setTime: tmpArray[0],
                selfTime: tmpArray
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
    // 배송에 의한 데이터 얻기
    getDeliveryData: function () {
        this.setData({
            pageLoading: true,
            deliveryItems: [],
            totalGoodsWeight: 0,
            totalPackageWeight: 0
        })

        const query = {
            nums: this.data.paramCart,
            deliveryId: this.data.deliveryId
        }

        api.request('carts/selected/delivery', query).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        type: response.data.type ? response.data.type : '',
                        userName: response.data.userName ? response.data.userName : '',
                        userPhone: response.data.userPhone ? response.data.userPhone : '',
                        provinceName: response.data.provinceName ? response.data.provinceName : '',
                        cityName: response.data.cityName ? response.data.cityName : '',
                        countryName: response.data.countryName ? response.data.countryName : '',
                        address: response.data.address ? response.data.address : '',
                        houseNo: response.data.houseNo ? response.data.houseNo : '',
                        deliveryStatus: response.data.deliveryStatus ? response.data.deliveryStatus : '',
                        deliveryId: response.data.deliveryId ? parseInt(response.data.deliveryId) : parseInt(this.data.deliveryId),
                        freeShippingStatus: response.data.freeShippingStatus ? response.data.freeShippingStatus : '0',
                        freePackageStatus: response.data.freePackageStatus ? response.data.freePackageStatus : '0',
                        freePackageNeededPrice: response.data.freePackageNeededPrice ? response.data.freePackageNeededPrice : 0,
                        freeShippingNeededPrice: response.data.freeShippingNeededPrice ? response.data.freeShippingNeededPrice : 0,
                        eventItems: response.data.eventItems ? response.data.eventItems : null,
                        pageLoading: false
                    })

                    const icons = wx.getStorageSync('siteinfo').goodsIconBeans

                    if (response.data.cartItems !== undefined && response.data.cartItems !== null) {
                        response.data.cartItems.filter((shop) => {
                            shop.goods.filter((prod) => {
                                icons.filter((icon) => {
                                    if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                        prod.goodsIconUrl = icon.iconUri
                                    }
                                })
                            })
                        })
                    }

                    // 무료배송상품이 있는 경우
                    if (response.data.freeItems !== undefined && response.data.freeItems !== null) {
                        let tmpFreeItems = []
                        tmpFreeItems.push(response.data.freeItems)

                        this.setData({
                            freeItems: tmpFreeItems,
                            totalGoodsWeight: this.data.totalGoodsWeight + response.data.freeItems.totalGoodsWeight
                        })
                    }

                    // 배달이면
                    if (response.data.type) {
                        this.setData({
                            doneDt: response.data.doneDt ? response.data.doneDt : '',
                            deliverySalesPrice: response.data.deliverySalesPrice ? response.data.deliverySalesPrice : 0,
                            deliveryOriginPrice: response.data.deliveryOriginPrice ? response.data.deliveryOriginPrice : 0,
                            initDistance: response.data.initDistance ? response.data.initDistance : 0,
                            initWeight: response.data.initWeight ? response.data.initWeight : 0,
                            distance: response.data.distance ? response.data.distance : 0,
                            weight: response.data.weight ? response.data.weight : 0,
                            totalGoodsWeight: response.data.weight ? this.data.totalGoodsWeight + response.data.weight : 0,
                            totalPrice: parseFloat(this.data.totalGoodsPrice) + parseFloat(response.data.deliverySalesPrice),
                            packagePrice: response.data.packagePrice,
                            cartItems: response.data.cartItems
                        })

                        if (response.data.distance < 0) {
                            this.setData({
                                warningKind: 'distance'
                            })
                            this.setShowWarningDialog('您的收货地址定位获取失败<br>请重新选取定位', '', 'one', '确认')
                        }
                    }

                    // 택배배송이면
                    if (!response.data.type) {
                        let tmpDeliveryItems = response.data.deliveryItems ? response.data.deliveryItems : []
                        let tmpGoodsWeight = 0
                        let tmpPackageWeight = 0
                        let tmpPackagePrice = 0
                        let tmpDeliveryCompanyPrice = 0
                        let tmpDeliveryCompanyOldPrice = 0
                        let tmpDeliveryCompany = []

                        tmpDeliveryItems.filter((res) => {
                            let key = -1
                            tmpGoodsWeight += res.totalGoodsWeight
                            tmpPackagePrice += res.totalPackagePrice
                            tmpPackageWeight += res.totalPackageWeight

                            if (!res.deliverySalePrice) {
                                res.deliverySalePrice = res.companyPrices[0].salesPrice
                                res.deliveryCostPrice = res.companyPrices[0].costPrice
                                res.deliveryType = res.companyPrices[0].deliveryType
                                res.deliveryOldPrice = res.companyPrices[0].salesOriPrice
                            }

                            tmpDeliveryCompanyPrice += parseFloat(res.deliverySalePrice)
                            tmpDeliveryCompanyOldPrice += parseFloat(res.deliveryOldPrice)

                            tmpDeliveryCompany.filter((value, index) => {
                                if (value.name === res.deliveryName) {
                                    key = index
                                }
                            })

                            if (key !== -1) {
                                tmpDeliveryCompany[key].price += res.deliverySalePrice
                            } else {
                                const value = {
                                    name: res.deliveryName,
                                    price: res.deliverySalePrice,
                                    deliveryType: res.deliveryType
                                }
                                tmpDeliveryCompany.push(value)
                            }
                        })

                        this.setData({
                            totalGoodsWeight: tmpGoodsWeight,
                            totalPackageWeight: tmpPackageWeight,
                            packagePrice: tmpPackagePrice,
                            totalDeliveryCompanyPrice: tmpDeliveryCompanyPrice,
                            totalDeliveryCompanyOldPrice: tmpDeliveryCompanyOldPrice,
                            useDeliveryCompany: tmpDeliveryCompany,
                            deliveryItems: tmpDeliveryItems,
                            totalPrice: parseFloat(this.data.totalGoodsPrice) + parseFloat(tmpPackagePrice) + parseFloat(tmpDeliveryCompanyPrice),
                            windowWidth: app.globalData.deviceInfo.windowWidth - 130
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
    // 시장에서 직접 구매 데이터
    getSelfData: function () {
        this.setData({
            pageLoading: true,
            deliveryItems: [],
            totalGoodsWeight: 0,
            totalPackageWeight: 0
        })
        const query = {
            nums: this.data.paramCart
        }

        api.request('carts/selected/self', query).then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    const icons = wx.getStorageSync('siteinfo').goodsIconBeans

                    if (response.data.cartItems !== undefined && response.data.cartItems !== null) {
                        response.data.cartItems.filter((shop) => {
                            shop.goods.filter((prod) => {
                                icons.filter((icon) => {
                                    if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                        prod.goodsIconUrl = icon.iconUri
                                    }
                                })
                            })
                        })
                    }

                    this.setData({
                        packageNum: response.data.packageNum ? response.data.packageNum : 0,
                        packagePrice: response.data.packagePrice ? response.data.packagePrice : 0,
                        totalGoodsWeight: response.data.totalWeight,
                        cartItems: response.data.cartItems,
                        totalPrice: this.data.totalGoodsPrice,
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

        // 해당 배송지를 얻지 못한 경우 처리
        if (this.data.warningKind === 'distance') {
            wx.navigateTo({
                url: 'pages/mypage/delivery/delivery'
            })
            return
        }

        // 일반경고 처리
        if (this.data.warningKind === 'warning') {
            return
        }

        // 택배인 경우 영업시간이 지났을때의 처리
        if (this.data.warningKind === 'delivery') {
            // 주문하기
            if (e.detail.index === 1) {
                this.setOrderData('normal')
            }
        }

        // 결제취소를 했을 때의 처리
        if (this.data.warningKind === 'pay') {
            // 주문만 하기
            if (e.detail.index === 0) {
                this.setOrderData('onlyorder')
            }

            // 결제 다시 진행하기
            if (e.detail.index === 1) {
                this.setPayWechat()
            }
        }
    },
    // 주문방식설정(택배, 배달)
    setTabKind: function (e) {
        if (this.data.isTabKind === e.currentTarget.dataset.kind) {
            return
        }

        // 배송으로 주문
        if (e.currentTarget.dataset.kind === '0') {
            this.getDeliveryData()
        }

        // 시장에서 직접주문
        if (e.currentTarget.dataset.kind === '1') {
            this.checkRunTimeMarket()

            // 서시장영업시간이 지났거나 직접 시장에 와서 가져가는 시간이 없다면
            if (this.data.isLimitTime || this.data.selfTime.length === 0) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('该时间段无法以<br>《到店自取》方式下单', '', 'one', '确认', '')
                return
            }

            this.getSelfData()
        }

        this.setData({
            isTabKind: e.currentTarget.dataset.kind,
            isShowDeliveryInfo: false
        })
    },
    // 주문정보 상세보기
    setDeliveryDetail: function () {
        this.setData({
            isShowDeliveryInfo: !this.data.isShowDeliveryInfo
        })
    },
    // 배송정보툴 로출
    setShowHelp: function (e) {
        this.setData({
            isShowHelp: true,
            isShowOverlay: true
        })

        if (e.currentTarget.dataset.kind === 'runner') {
            this.setData({
                basicPrice: this.data.deliverySalesPrice,
                overStreet: this.data.initDistance,
                overWeight: this.data.initWeight,
                totalStreet: this.data.distance
            })
        }

        if (e.currentTarget.dataset.kind === 'air') {
            this.setData({
                basicPrice: this.data.airPrice,
                overWeight: this.data.airWeight
            })
        }

        if (e.currentTarget.dataset.kind === 'normal') {
            this.setData({
                basicPrice: this.data.normalPrice,
                overWeight: this.data.normalWeight
            })
        }
    },
    // 폰인증다이얼로그 로출설정
    setShowPhoneAuthDialog: function () {
        this.setData({
            isShowPhoneBound: true,
            isShowOverlay: true,
            phone: '',
            authCode: '',
            isSubmitCode: false
        })
    },
    // 백그라운드 오버레이 숨기기 설정
    setHideOverlay: function () {
        this.setData({
            isShowHelp: false,
            isShowOverlay: false,
            isShowPhoneBound: false,
            isShowSelfTimeTool: false,
            isShowCompanyTool: false
        })
    },
    // 문자렬 입력시 이벤트
    setInputValue: function (e) {
        if (e.currentTarget.dataset.kind === 'selfphone') {
            this.setData({
                selfPhone: e.detail.value.replace(/[^0-9]/g, '').trim()
            })
        }

        if (e.currentTarget.dataset.kind === 'remark') {
            this.setData({
                remark: e.detail.value
            })
        }

        if (e.currentTarget.dataset.kind === 'phone') {
            this.setData({
                phone: e.detail.value.replace(/[^0-9]/g, '').trim()
            })
        }

        if (e.currentTarget.dataset.kind === 'auth') {
            this.setData({
                authCode: e.detail.value.replace(/[^0-9]/g, '').trim()
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
    // 택배배송회사 선택툴 로출
    setShowCompanyTool: function (e) {
        this.setData({
            isShowCompanyTool: true,
            isShowOverlay: true,
            deliveryCompanyCode: e.currentTarget.dataset.code,
            deliveryCompanyIndex: e.currentTarget.dataset.index,
            deliveryCompanies: e.currentTarget.dataset.company
        })
    },
    // 택배배송회사 선택
    setDeliveryCompany: function (e) {
        this.setData({
            totalDeliveryCompanyPrice: 0,
            useDeliveryCompany: []
        })

        let tmpGoodsWeight = 0
        let tmpPackageWeight = 0
        let tmpPackagePrice = 0
        let tmpDeliveryCompanyPrice = 0
        let tmpDeliveryCompanyOldPrice = 0
        let tmpDeliveryCompany = []

        this.data.deliveryCompanies.filter((res) => {
            if (res.companyCode === e.currentTarget.dataset.code) {
                let tmpDeliveryItems = this.data.deliveryItems
                tmpDeliveryItems[this.data.deliveryCompanyIndex].deliveryName = res.companyName
                tmpDeliveryItems[this.data.deliveryCompanyIndex].deliveryCode = res.companyCode
                tmpDeliveryItems[this.data.deliveryCompanyIndex].deliverySalePrice = res.salesPrice
                tmpDeliveryItems[this.data.deliveryCompanyIndex].deliveryCostPrice = res.costPrice
                tmpDeliveryItems[this.data.deliveryCompanyIndex].deliveryType = res.deliveryType

                this.setData({
                    deliveryItems: tmpDeliveryItems
                })
            }
        })

        this.data.deliveryItems.filter((res) => {
            let key = -1
            tmpGoodsWeight += res.totalGoodsWeight
            tmpPackageWeight += res.totalPackageWeight
            tmpPackagePrice += res.totalPackagePrice

            if (!res.deliverySalePrice) {
                res.deliverySalePrice = res.companyPrices[0].salesPrice
                res.deliveryCostPrice = res.companyPrices[0].costPrice
                res.deliveryType = res.companyPrices[0].deliveryType
                res.deliveryOldPrice = res.companyPrices[0].salesOriPrice
            }

            tmpDeliveryCompanyPrice += parseFloat(res.deliverySalePrice)
            tmpDeliveryCompanyOldPrice += parseFloat(res.deliveryOldPrice)

            tmpDeliveryCompany.filter((value, index) => {
                if (value.name === res.deliveryName) {
                    key = index
                }
            })

            if (key !== -1) {
                tmpDeliveryCompany[key].price += res.deliverySalePrice
            } else {
                const value = {
                    name: res.deliveryName,
                    price: res.deliverySalePrice,
                    deliveryType: res.deliveryType
                }
                tmpDeliveryCompany.push(value)
            }
        })

        this.setData({
            totalGoodsWeight: tmpGoodsWeight,
            totalPackageWeight: tmpPackageWeight,
            packagePrice: tmpPackagePrice,
            totalDeliveryCompanyPrice: tmpDeliveryCompanyPrice,
            totalDeliveryCompanyOldPrice: tmpDeliveryCompanyOldPrice,
            useDeliveryCompany: tmpDeliveryCompany,
            totalPrice: parseFloat(this.data.totalGoodsPrice) + parseFloat(tmpPackagePrice) + parseFloat(tmpDeliveryCompanyPrice)
        })

        this.setHideOverlay()
    },
    // 서시장에서 직접 구매할수 있는 시간리스트 툴 로출
    setShowSelfTimeTool: function () {
        this.setData({
            isShowSelfTimeTool: true,
            isShowOverlay: true
        })
    },
    // 서시장에 와서 구매할 시간을 설정
    setSelfTime: function (e) {
        this.setData({
            setTime: this.data.selfTime[parseInt(e.currentTarget.dataset.index)],
            isShowSelfTimeTool: false,
            isShowOverlay: false
        })
    },
    // 시장에서 직접 주문시 동의 체크설정
    checkSelfAgree: function () {
        this.setData({
            isSelfAgree: !this.data.isSelfAgree
        })
    },
    // 주문하기
    setPaymentData: function (e) {
        if (this.data.isClicked) {
            return
        }

        this.checkRunTimeMarket()

        // 배송에 의한 주문
        if (this.data.isTabKind === '0') {
            // 시장운영시간이 지나면 택배인 경우 계속 주문을 하겠는지 팝업 띄우기
            if (this.data.deliveryItems.length !== 0 && this.data.isLimitTime) {
                this.setData({
                    warningKind: 'delivery'
                })
                this.setShowWarningDialog('当前为西市场非营业时间<br>是否同意下一个工作日安排派送？', '', 'two', '放弃下单', '继续下单')
                return
            }

            // 시장운영시간이 지나면 배달인 경우 주문 불가
            if (this.data.type === 'runner' && this.data.isLimitTime) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('同城市场配送时间<br>(' + wx.getStorageSync('siteinfo').beginTime + '~' + wx.getStorageSync('siteinfo').endTime + ')', '', 'one', '确认', '')
                return
            }

            // 배송지가 없으면 배송지를 추가하라는 메세지 띄우기
            if (this.data.deliveryId === 0) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('请添加收货地址', '', 'one', '确认', '')
                return
            }
        }

        // 시장에서의 직접 주문
        if (this.data.isTabKind === '1') {
            if (this.data.isLimitTime || this.data.selfTime.length === 0) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('该时间段无法以<br>《到店自取》方式下单', '', 'one', '确认', '')
                return
            }

            // 동의사항을 체크하지 않은 경우
            if (!this.data.isSelfAgree) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('请先同意《到店自取服务协议》', '', 'one', '确认', '')
                return
            }

            // 련락처폰번호를 입력하지 않은 경우
            if (this.data.selfPhone.trim() === '') {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('请输入预留电话', '', 'one', '确认', '')
                return
            } else if (this.data.selfPhone.length !== 11) {
                this.setData({
                    warningKind: 'warning'
                })
                this.setShowWarningDialog('请正确输入电话号码', '', 'one', '确认', '')
                return
            }
        }

        this.setOrderData('normal')
    },
    // 주문처리 진행
    setOrderData: function (index) {
        this.setData({
            pageLoading: true,
            isClicked: true
        })

        // 정상적인 주문인 경우
        if (index === 'normal') {
            // 앱에 사용자의 폰이 바운딩 안되어있으면 폰바운딩 팝업 로출
            if (this.data.phoneBound.trim() === '') {
                this.setData({
                    pageLoading: false,
                    isClicked: false
                })

                this.setShowPhoneAuthDialog()
                return
            }

            let goodsData = []

            this.data.paramCart.split('|').filter((res) => {
                let value = {
                    id: parseInt(res.split(',')[0]),
                    num: parseInt(res.split(',')[1])
                }

                goodsData.push(value)
            })

            // 배송에 의한 주문
            if (this.data.isTabKind === '0') {
                let deliveryCompanyCode = ''
                let airCompanyCode = ''

                this.data.deliveryItems.filter((res) => {
                    // 택배배송회사를 수정가능한 상품의 택배배송회사코드만 배렬에 담기
                    if (res.canChangeDelivery === '1') {
                        if (res.deliveryType === 1) {
                            deliveryCompanyCode = res.deliveryCode
                        } else {
                            airCompanyCode = res.deliveryCode
                        }
                    }
                })

                const query = {
                    deliveryId: this.data.deliveryId,
                    clientType: 2,
                    remark: this.data.remark,
                    goods: goodsData,
                    deliveryCompanyCode: deliveryCompanyCode,
                    airCompanyCode: airCompanyCode
                }

                api.request('orders/delivery', query, 'POST').then((response) => {
                    if (response.action) {
                        if (response.data !== null) {
                            api.request('carts/num').then((resp) => {
                                if (response.data !== null) {
                                    wx.setStorageSync('cart_count', resp.data)
                                    this.setData({
                                        orderId: parseInt(response.data.id),
                                        orderNumber: response.data.no,
                                        pageLoading: false,
                                        isClicked: false
                                    })
                                    this.setPayWechat()
                                }
                            })
                        } else {
                            this.setData({
                                pageLoading: false,
                                isClicked: false
                            })
                        }
                    } else {
                        if (response.code === 400) {
                            this.setData({
                                pageLoading: false,
                                isClicked: false,
                                isShowToast: true,
                                toastMessage: response.msg
                            })
                        } else {
                            this.setData({
                                pageLoading: false,
                                isClicked: false
                            })
                        }
                    }
                })
            }

            // 시장에서의 직접 주문
            if (this.data.isTabKind === '1') {
                const todayDate = util.formatDate(new Date(), '-') // 현재의 년,월,일
                const hour = this.data.setTime.split(':')[0]
                const minute = this.data.setTime.split(':')[1]
                const time = util.numberPad(hour, 2) + ':' + minute
                const query = {
                    phoneNum: this.data.selfPhone,
                    takeDt: todayDate + ' ' + time + ':00',
                    clientType: 2,
                    remark: this.data.remark,
                    goods: goodsData
                }

                api.request('orders/self', query, 'POST').then((response) => {
                    if (response.action) {
                        if (response.data !== null) {
                            api.request('carts/num').then((resp) => {
                                if (response.data !== null) {
                                    wx.setStorageSync('cart_count', resp.data)
                                    this.setData({
                                        orderId: parseInt(response.data.id),
                                        orderNumber: response.data.no,
                                        pageLoading: false,
                                        isClicked: false
                                    })
                                    this.setPayWechat()
                                }
                            })
                        } else {
                            this.setData({
                                pageLoading: false,
                                isClicked: false
                            })
                        }
                    } else {
                        this.setData({
                            pageLoading: false,
                            isClicked: false
                        })
                    }
                })
            }
        } else {
            // 결제취소후 결제를 하지 않고 주문만 하는 경우
            api.request(`orders/payCancel/${this.data.orderNumber}`, {}, 'PUT').then((response) => {
                if (response.action) {
                    this.setData({
                        pageLoading: false,
                        isClicked: false
                    })

                    wx.reLaunch({
                        url: '/pages/mypage/order/order_detail/order_detail?orderid=' + this.data.orderId
                    })
                } else {
                    this.setData({
                        pageLoading: false,
                        isClicked: false
                    })
                }
            })
        }
    },
    // 위챗결제 처리
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

                            if (err.errMsg === 'requestPayment:fail cancel') {
                                this.setShowWarningDialog('确认要放弃本次付款', '您的订单将保留一段时间，到时间后将被自动取消', 'two', '确认离开', '继续支付')
                            }

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
