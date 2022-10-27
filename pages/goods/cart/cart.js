// pages/goods/cart/cart.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '购物车', // 네비게이션 타이틀
        navBtnTitle: '编辑', // 네비게이션 버튼타이틀
        isCartEmpty: false, // 장바구니 비여있는지 확인여부
        heightContent: 0, // 장바구니페지 높이값
        freeStatus: '0', // 배송조건
        cartItems: [], // 장바구니배렬,
        originCartData: [], // 첫 장바구니상태배렬
        isCheckAll: false, // 전체 선택
        totalPrice: 0, // 총합계
        totalWeight: 0, // 총무게
        totalGoods: 0, // 총상품수
        isShowEdit: false, // 편집상태여부
        isModifyStatus: false, // 장바구니에 담긴 상품개수가 변경되였는지 체크하는 상태값
        isDeviceHeight: app.globalData.isDeviceHeight,
        isActiveStatus: false, // 버튼 액티브상태값
        isShowSheet: false, // 메뉴툴로출여부
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [{ text: '否' }, { text: '是' }],
        isNavRightBtn: true,
        animateSetting: null, // 메뉴애니메이션
        isScroll: false, // 스크롤진행여부
        isShowControlMenu: true, // 장바구니, 메뉴아이콘로출여부
        freeShippingStatus: '0', // 가격에 따르는 무료배송상태
        freeShippingNeededPrice: 0, // 무료배송상태가 될수 있는 기준가격
        freePackageStatus: '0', // 패키지가격에 따르는 무료배송상태
        freePackageNeededPrice: 0, // 무료배송상태가 될수 있는 기준패키지가격
        deliveryStatus: '', // 배송지존재여부값
        totalPriceByEvent: 0
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        wx.removeStorageSync('deliveryid')
        wx.setStorageSync('callMenuUrl', 'cart')
        util.setDisableShareWechat()
        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')

        if (elementNavigation[0] !== null) {
            this.setData({
                heightContent: app.globalData.deviceInfo.windowHeight - elementNavigation[0].height
            })
        }

        // 장바구니에서 변경한 상품개수 저장(1초에 한번씩 변경된 정보 저장)
        setInterval(() => {
            if (this.data.isModifyStatus) {
                this.setData({
                    isModifyStatus: false
                })
            }

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
        }, 2000)
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        wx.removeStorageSync('deliveryid')
        wx.setStorageSync('callMenuUrl', 'cart')
        this.getCartData()
        this.setData({
            isShowEdit: false
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
    onShareAppMessage: function () {},
    /**
     * Called when scroll move
     */
    onPageScroll: function () {
        this.setData({
            isScroll: true
        })
    },
    // 장바구니 데이터 얻기
    getCartData: async function () {
        let tempData = []
        let tempSubData = []
        this.setData({
            pageLoading: true,
            isCheckAll: false,
            totalPrice: 0,
            totalPriceByEvent: 0,
            totalWeight: 0,
            totalGoods: 0,
            isActiveStatus: false,
            isModifyStatus: false,
            freeShippingStatus: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.status : '0',
            freeShippingNeededPrice: wx.getStorageSync('siteinfo').freeShippingDto ? wx.getStorageSync('siteinfo').freeShippingDto.price : 0,
            freePackageStatus: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.status : '0',
            freePackageNeededPrice: wx.getStorageSync('siteinfo').freePackageDto ? wx.getStorageSync('siteinfo').freePackageDto.price : 0
        })
        const response = await api.request('carts')

        if (response.action) {
            if (response.data !== null) {
                const icons = wx.getStorageSync('siteinfo').goodsIconBeans
                this.setData({
                    freeStatus: response.data.freeStatus
                })

                if (response.data.cartItems !== undefined && response.data.cartItems !== null) {
                    response.data.cartItems.filter((shop) => {
                        tempSubData = []
                        shop.checked = false

                        shop.goods.filter((prod) => {
                            prod.checked = false
                            const value = {
                                id: prod.id,
                                num: prod.num
                            }
                            tempSubData.push(value)

                            icons.filter((icon) => {
                                if (prod.goodsIconName === icon.iconName && prod.goodsIconName !== '' && prod.goodsIconName !== null && prod.goodsIconName !== undefined) {
                                    prod.goodsIconUrl = icon.iconUri
                                }
                            })
                        })

                        const val = {
                            shopId: shop.shopId,
                            goodsInfo: tempSubData
                        }

                        tempData.push(val)
                    })

                    this.setData({
                        cartItems: response.data.cartItems,
                        originCartData: tempData,
                        isCartEmpty: response.data.cartItems.length !== 0 ? false : true,
                        isNavRightBtn: response.data.cartItems.length !== 0 ? true : false,
                        deliveryStatus: response.data.deliveryStatus ? response.data.deliveryStatus : '0',
                        pageLoading: false
                    })
                }
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        } else {
            this.setData({
                pageLoading: false,
                isCartEmpty: true,
                isNavRightBtn: false
            })
        }
    },
    // 점포 선택
    setShopSelect: function (e) {
        // 개별적인 점포 선택
        this.data.cartItems.filter((shop) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.checked = !shop.checked

                shop.goods.filter((prod) => {
                    prod.checked = shop.checked
                })
            }
        })

        // 점포선택에 따르는 전체 선택여부
        let isCheckedAll = false
        let isActive = false
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0
        let totalGoods = 0

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (!prod.checked) {
                    isCheckedAll = true
                }

                if (prod.checked) {
                    isActive = true
                    // 선택된 상품의 총가격 계산
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                    totalGoods++
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            isCheckAll: isCheckedAll ? false : true,
            isActiveStatus: isActive,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight,
            totalGoods: totalGoods
        })
    },
    // 상품 선택
    setGoodsSelect: function (e) {
        // 개별적인 상품 선택
        this.data.cartItems.filter((shop) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod) => {
                    if (prod.id === e.currentTarget.dataset.prodid) {
                        prod.checked = !prod.checked
                    }
                })
            }
        })

        // 상품선택에 따르는 점포 선택여부
        let isCheckedGood = false

        this.data.cartItems.filter((shop) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod) => {
                    if (!prod.checked) {
                        isCheckedGood = true
                    }
                })

                shop.checked = isCheckedGood ? false : true
            }
        })

        // 상품선택에 따르는 전체 선택여부
        let isCheckedAll = false
        let isActive = false
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0
        let totalGoods = 0

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (!prod.checked) {
                    isCheckedAll = true
                }

                if (prod.checked) {
                    isActive = true
                    // 선택된 상품의 총가격 계산
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                    totalGoods++
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            isCheckAll: isCheckedAll ? false : true,
            isActiveStatus: isActive,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight,
            totalGoods: totalGoods
        })
    },
    // 전체 선택
    setSelectAll: function () {
        this.setData({
            isCheckAll: !this.data.isCheckAll
        })

        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0
        let totalGoods = 0

        this.data.cartItems.filter((shop) => {
            shop.checked = this.data.isCheckAll

            shop.goods.filter((prod) => {
                prod.checked = this.data.isCheckAll
                // 전체 상품의 총가격
                if (this.data.isCheckAll) {
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                    totalGoods++
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            isActiveStatus: this.data.isCheckAll,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight,
            totalGoods: totalGoods
        })
    },
    // 상품개수 감소
    setMinus: function (e) {
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0

        this.data.cartItems.filter((shop, index) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod, idx) => {
                    if (prod.id === e.currentTarget.dataset.prodid) {
                        if (prod.num === 1 || this.data.isModifyStatus) {
                            return
                        }

                        prod.num--

                        if (this.data.originCartData[index].goodsInfo[idx].num !== prod.num) {
                            const query = {
                                id: prod.id,
                                num: prod.num
                            }

                            api.request('carts/num', query, 'PUT').then((response) => {
                                this.data.originCartData[index].goodsInfo[idx].num = prod.num

                                this.setData({
                                    originCartData: this.data.originCartData
                                })
                            })
                        }
                    }
                })
            }
        })

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            isModifyStatus: true,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight
        })
    },
    // 상품개수 증가
    setPlus: function (e) {
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0

        this.data.cartItems.filter((shop, index) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod, idx) => {
                    if (prod.id === e.currentTarget.dataset.prodid) {
                        if (prod.num >= 99 || this.data.isModifyStatus) {
                            return
                        }

                        prod.num++

                        if (this.data.originCartData[index].goodsInfo[idx].num !== prod.num) {
                            const query = {
                                id: prod.id,
                                num: prod.num
                            }

                            api.request('carts/num', query, 'PUT').then((response) => {
                                this.data.originCartData[index].goodsInfo[idx].num = prod.num

                                this.setData({
                                    originCartData: this.data.originCartData
                                })
                            })
                        }
                    }
                })
            }
        })

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            isModifyStatus: true,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight
        })
    },
    // 키로 입력
    inputKey: function (e) {
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0

        this.data.cartItems.filter((shop) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod) => {
                    if (prod.id === e.currentTarget.dataset.prodid) {
                        if (e.detail.value === '') {
                            prod.num = ''
                        } else {
                            prod.num = parseInt(e.detail.value.replace(/[^0-9]/g, ''))
                        }
                    }
                })
            }
        })

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    const cnt = prod.num === '' ? 1 : parseInt(prod.num)
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, cnt, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, cnt, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * cnt
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight
        })
    },
    // 해당 입력창에서 초점이 해제될 때
    inputBlue: function (e) {
        let totalPrice = 0
        let totalPriceByEvent = 0
        let totalWeight = 0

        this.data.cartItems.filter((shop, index) => {
            if (shop.shopId === e.currentTarget.dataset.shopid) {
                shop.goods.filter((prod, idx) => {
                    if (prod.id === e.currentTarget.dataset.prodid) {
                        if (e.detail.value === '') {
                            prod.num = 1
                        } else {
                            prod.num = parseInt(e.detail.value)
                        }

                        if (this.data.originCartData[index].goodsInfo[idx].num !== prod.num) {
                            const query = {
                                id: prod.id,
                                num: prod.num
                            }

                            api.request('carts/num', query, 'PUT').then((response) => {
                                this.data.originCartData[index].goodsInfo[idx].num = prod.num

                                this.setData({
                                    originCartData: this.data.originCartData
                                })
                            })
                        }
                    }
                })
            }
        })

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    totalPrice += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')

                    if (prod.eventStatus === '1') {
                        totalPriceByEvent += util.setCalculatePriceAndQuantity(prod.salesPrice, 0, prod.num, 'plus')
                    }

                    totalWeight += parseFloat(prod.weight) * prod.num
                }
            })
        })

        if (totalPrice.toString().indexOf('.') !== -1) {
            const temp = totalPrice.toString().split('.')[1]
            totalPrice = temp.length > 2 ? parseFloat(totalPrice.toFixed(1)) : totalPrice
        }

        if (totalPriceByEvent.toString().indexOf('.') !== -1) {
            const temp = totalPriceByEvent.toString().split('.')[1]
            totalPriceByEvent = temp.length > 2 ? parseFloat(totalPriceByEvent.toFixed(1)) : totalPriceByEvent
        }

        this.setData({
            cartItems: this.data.cartItems,
            totalPrice: totalPrice,
            totalPriceByEvent: totalPriceByEvent,
            totalWeight: totalWeight
        })
    },
    // 네비게이션 버튼 액션
    setRightBtn: function (e) {
        this.data.cartItems.filter((shop) => {
            shop.checked = false

            shop.goods.filter((prod) => {
                prod.checked = false
            })
        })

        this.setData({
            isShowEdit: e.detail,
            navBtnTitle: e.detail ? '完成' : '编辑',
            cartItems: this.data.cartItems,
            isCheckAll: false,
            totalPrice: 0,
            totalPriceByEvent: 0,
            totalWeight: 0,
            totalGoods: 0,
            isActiveStatus: false,
            isModifyStatus: false
        })
    },
    // 주문하기
    setOrder: function () {
        if (!this.data.isActiveStatus) {
            return
        }

        let query = ''

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    query += prod.id + ',' + prod.num + '|'
                }
            })
        })

        if (this.data.deliveryStatus === '0') {
            wx.navigateTo({
                url: '/delivery/pages/delivery?param=' + query.slice(0, query.length - 1) + '&price=' + this.data.totalPrice + '&weight=' + this.data.totalWeight
            })
        } else {
            wx.navigateTo({
                url: '/pages/goods/order/order?param=' + query.slice(0, query.length - 1) + '&price=' + this.data.totalPrice + '&weight=' + this.data.totalWeight
            })
        }
    },
    // 장바구니상품 삭제
    setDelete: function () {
        if (!this.data.isActiveStatus) {
            return
        }
        this.setData({
            isShowWarningDialog: true
        })
    },
    // 경고다이얼로그 로출
    setDeleteConfirm: function (e) {
        this.setData({
            isShowWarningDialog: false
        })

        // 삭제 취소인 경우
        if (e.detail.index === 0) {
            return
        }

        let cartIds = []

        this.data.cartItems.filter((shop) => {
            shop.goods.filter((prod) => {
                if (prod.checked) {
                    cartIds.push(prod.id)
                }
            })
        })

        const query = {
            ids: cartIds
        }

        api.request('carts', query, 'DELETE').then((response) => {
            if (response.action) {
                api.request('carts/num').then((resp) => {
                    wx.setStorageSync('cart_count', resp.data)
                    this.getCartData()
                })
            }
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
