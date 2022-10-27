// pages/mypage/delivery/delivery_info/delivery_info.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const app = getApp()
const jsonData1 = require('resource/location_1.js')
const jsonData2 = require('resource/location_2.js')
const jsonData3 = require('resource/location_3.js')

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '', // 네비게이션 타이틀
        deliveryId: 0, // 수화주소아이디
        isShowToast: false, // 커스텀 토스트로출여부
        toastMessage: '', // 토스트메세지내용
        address: '', // 수화주소
        addressDetail: '', // 수화상세주소
        houseNo: '', // 수화상세주소
        userName: '', // 수화인
        phoneNum: '', // 수화인전화번호
        isAddressDefault: false, // 디폴트수화주소상태
        provinceData: [], // 전국의 성,시,지역정보
        provinceId: 0, // 수회주소 성아이디
        cityId: 0, // 수화주소 시아이디
        countryId: 0, // 수화주소 지역아이디
        provinceName: '', // 성명
        cityName: '', // 시명
        countryName: '', // 지역명
        isShowAddressList: false, // 주소선택팝업로출여부
        cityData: [], // 시배렬
        countryData: [], // 지역배렬
        locationResult: ['请选择'], // 주소선택결과
        activeItem: '请选择',
        gpsInfo: '', // 사용자지정위치정보(위도, 경도)
        isShowMap: false, // 연길시인 경우 지도로 위치정보
        isShowOverlay: false, // 백그라운드 오버레이 로출상태
        isShowLocationTool: false, // 지역선택로출상태
        isDevice: false,
        currPos: 0, // 스와이프포지션값
        scrollTop: 0,
        authLocationMsg: ''
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        util.setDisableShareWechat()

        jsonData1.data.filter((res) => {
            this.data.provinceData.push(res)
        })

        jsonData2.data.filter((res) => {
            this.data.provinceData.push(res)
        })

        jsonData3.data.filter((res) => {
            this.data.provinceData.push(res)
        })

        this.setData({
            deliveryId: parseInt(options.deliveryid),
            navTitle: parseInt(options.deliveryid) === 0 ? '新增收货地址' : '修改收货地址',
            provinceData: this.data.provinceData,
            isDevice: app.globalData.deviceInfo.model.search('iPhone X') !== -1 ? true : false
        })

        if (parseInt(this.data.deliveryId) !== 0) {
            this.getDeliveryData()
        }
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
    // 사용자의 배송정보 얻기
    getDeliveryData: function () {
        this.setData({
            pageLoading: true
        })

        api.request('delivery').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        locationResult: []
                    })

                    response.data.filter((res) => {
                        if (res.id === this.data.deliveryId) {
                            this.setData({
                                address: res.province + ' ' + res.city + ' ' + res.country,
                                provinceName: res.province,
                                cityName: res.city,
                                countryName: res.country,
                                addressDetail: res.address,
                                houseNo: res.country === '延吉市' ? res.houseNo : res.address,
                                userName: res.userName,
                                phoneNum: res.phoneNum,
                                isAddressDefault: res.isDefault === '1' ? true : false,
                                gpsInfo: res.gpsInfo,
                                isShowMap: res.country === '延吉市' ? true : false
                            })

                            this.data.provinceData.filter((prov) => {
                                if (prov.name === res.province) {
                                    this.setData({
                                        provinceId: prov.adcode,
                                        cityData: prov.districts
                                    })

                                    prov.districts.filter((city) => {
                                        if (city.name === res.city) {
                                            this.setData({
                                                cityId: city.adcode,
                                                countryData: city.districts
                                            })

                                            city.districts.filter((country) => {
                                                if (country.name === res.country) {
                                                    this.setData({
                                                        countryId: country.adcode
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })

                            this.data.locationResult.push(res.province)
                            this.data.locationResult.push(res.city)
                            this.data.locationResult.push(res.country)

                            this.setData({
                                locationResult: this.data.locationResult
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
    // 지도 실행
    setLocationMap: function () {
        let that = this

        wx.getSetting({
            success(res) {
                if (res.authSetting['scope.userLocation'] === undefined) {
                    wx.chooseLocation({
                        success(response) {
                            if (response.name.trim() !== '') {
                                that.setData({
                                    addressDetail: response.name,
                                    gpsInfo: response.longitude + ',' + response.latitude
                                })
                            }
                        },
                        fail(err) {}
                    })
                } else if (res.authSetting['scope.userLocation']) {
                    wx.chooseLocation({
                        success(response) {
                            if (response.name.trim() !== '') {
                                that.setData({
                                    addressDetail: response.name,
                                    gpsInfo: response.longitude + ',' + response.latitude
                                })
                            }
                        },
                        fail(err) {}
                    })
                } else {
                    wx.openSetting({
                        success(res) {
                            wx.chooseLocation({
                                success(response) {
                                    if (response.name.trim() !== '') {
                                        that.setData({
                                            addressDetail: response.name,
                                            gpsInfo: response.longitude + ',' + response.latitude
                                        })
                                    }
                                },
                                fail(err) {}
                            })
                        },
                        fail(res) {
                            wx.chooseLocation({
                                success(response) {
                                    if (response.name.trim() !== '') {
                                        that.setData({
                                            addressDetail: response.name,
                                            gpsInfo: response.longitude + ',' + response.latitude
                                        })
                                    }
                                },
                                fail(err) {}
                            })
                        }
                    })
                }
            },
            fail(err) {}
        })
    },
    // 저장하기
    setDelivery: function () {
        if (this.data.address.trim() === '') {
            this.setData({
                isShowToast: true,
                toastMessage: '请选择收货地址'
            })
            return
        }

        if (this.data.addressDetail.trim() === '' && this.data.isShowMap) {
            this.setData({
                isShowToast: true,
                toastMessage: '请输入详细地址'
            })
            return
        }

        if (this.data.houseNo.trim() === '' && !this.data.isShowMap) {
            this.setData({
                isShowToast: true,
                toastMessage: '请输入门牌地址'
            })
            return
        }

        if (this.data.userName.trim() === '') {
            this.setData({
                isShowToast: true,
                toastMessage: '请输入收货人姓名'
            })
            return
        }

        if (this.data.phoneNum.trim() === '') {
            this.setData({
                isShowToast: true,
                toastMessage: '请输入收货人手机号码'
            })
            return
        }

        if (this.data.phoneNum.trim().length !== 11) {
            this.setData({
                isShowToast: true,
                toastMessage: '请正确输入电话号码'
            })
            return
        }

        this.setData({
            pageLoading: true
        })

        const query = {
            userName: this.data.userName,
            phoneNum: this.data.phoneNum,
            provinceId: parseInt(this.data.provinceId),
            cityId: parseInt(this.data.cityId),
            countryId: parseInt(this.data.countryId),
            addressInfo: this.data.isShowMap ? this.data.addressDetail.replace(/(\s*)/g, '') : this.data.houseNo,
            houseNo: this.data.isShowMap ? this.data.houseNo : '',
            gpsInfo: this.data.gpsInfo,
            provinceName: this.data.provinceName,
            cityName: this.data.cityName,
            countryName: this.data.countryName
        }

        // 배송주소 추가
        if (parseInt(this.data.deliveryId) === 0) {
            api.request('delivery', query, 'POST').then((response) => {
                if (response.action) {
                    this.setData({
                        pageLoading: false
                    })

                    wx.navigateBack({
                        delta: 1
                    })
                } else {
                    this.setData({
                        pageLoading: false
                    })
                }
            })
        } else {
            // 수정하기
            api.request(`delivery/${this.data.deliveryId}`, query, 'PUT').then((response) => {
                if (response.action) {
                    if (this.data.isAddressDefault) {
                        api.request(`delivery/setDefault/${this.data.deliveryId}`, {}, 'PUT').then((res) => {
                            if (res.action) {
                                this.setData({
                                    pageLoading: false
                                })

                                wx.navigateBack({
                                    delta: 1
                                })
                            } else {
                                this.setData({
                                    pageLoading: false
                                })
                            }
                        })
                    } else {
                        this.setData({
                            pageLoading: false
                        })

                        wx.navigateBack({
                            delta: 1
                        })
                    }
                } else {
                    this.setData({
                        pageLoading: false
                    })
                }
            })
        }
    },
    // 지역선택스와이프 변화상태
    setChangeSwiper: function (e) {
        const position = e.detail.current
        this.setData({
            scrollTop: 0
        })

        if (this.data.locationResult[position]) {
            this.setData({
                activeItem: this.data.locationResult[position]
            })
        }

        // 선택된 지역을 리스트의 맨우로 올리기
        switch (position) {
            case 0: // 성 선택
                this.data.provinceData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.provinceData[idx]
                        this.data.provinceData[idx] = this.data.provinceData[0]
                        this.data.provinceData[0] = tmp
                        this.setData({
                            provinceData: this.data.provinceData
                        })
                    }
                })
                break
            case 1: // 시 선택
                this.data.cityData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.cityData[idx]
                        this.data.cityData[idx] = this.data.cityData[0]
                        this.data.cityData[0] = tmp
                        this.setData({
                            cityData: this.data.cityData
                        })
                    }
                })
                break
            case 2: // 지역 선택
                this.data.countryData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.countryData[idx]
                        this.data.countryData[idx] = this.data.countryData[0]
                        this.data.countryData[0] = tmp
                        this.setData({
                            countryData: this.data.countryData
                        })
                    }
                })
                break
        }
    },
    // 선택된 지역탭 선택
    setTabAddress: function (e) {
        this.setData({
            activeItem: this.data.locationResult[e.currentTarget.dataset.index],
            scrollTop: 0,
            currPos: e.currentTarget.dataset.index
        })

        // 선택된 지역을 리스트의 맨우로 올리기
        switch (e.currentTarget.dataset.index) {
            case 0: // 성 선택
                this.data.provinceData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.provinceData[idx]
                        this.data.provinceData[idx] = this.data.provinceData[0]
                        this.data.provinceData[0] = tmp
                        this.setData({
                            provinceData: this.data.provinceData
                        })
                    }
                })
                break
            case 1: // 시 선택
                this.data.cityData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.cityData[idx]
                        this.data.cityData[idx] = this.data.cityData[0]
                        this.data.cityData[0] = tmp
                        this.setData({
                            cityData: this.data.cityData
                        })
                    }
                })
                break
            case 2: // 지역 선택
                this.data.countryData.filter((res, idx) => {
                    if (res.name === this.data.activeItem) {
                        const tmp = this.data.countryData[idx]
                        this.data.countryData[idx] = this.data.countryData[0]
                        this.data.countryData[0] = tmp
                        this.setData({
                            countryData: this.data.countryData
                        })
                    }
                })
                break
        }
    },
    // 성 선택
    setProvince: function (e) {
        this.data.locationResult = []
        this.data.locationResult.push(e.currentTarget.dataset.name)
        this.data.locationResult.push('请选择')

        this.setData({
            address: '',
            countryData: [],
            locationResult: this.data.locationResult,
            provinceName: e.currentTarget.dataset.name,
            cityData: e.currentTarget.dataset.city,
            provinceId: e.currentTarget.dataset.adcode,
            activeItem: '请选择'
        })

        if (e.currentTarget.dataset.city.length !== 0) {
            this.setData({
                currPos: 1
            })
        } else {
            this.data.locationResult.filter((res) => {
                this.data.address += res + ' '
                this.setData({
                    address: this.data.address
                })
            })

            this.setHideOverlay()
        }
    },
    // 시 선택
    setCity: function (e) {
        const tmp = this.data.locationResult
        this.data.locationResult = []
        this.data.locationResult.push(tmp[0])
        this.data.locationResult.push(e.currentTarget.dataset.name)
        this.data.locationResult.push('请选择')

        this.setData({
            address: '',
            countryData: e.currentTarget.dataset.country,
            cityName: e.currentTarget.dataset.name,
            locationResult: this.data.locationResult,
            cityId: e.currentTarget.dataset.adcode,
            activeItem: '请选择'
        })

        if (e.currentTarget.dataset.country.length !== 0) {
            this.setData({
                currPos: 2
            })
        } else {
            this.data.locationResult.filter((res) => {
                this.data.address += res + ' '
                this.setData({
                    address: this.data.address
                })
            })

            this.setHideOverlay()
        }
    },
    // 지역 선택
    setCountry: function (e) {
        const tmp = this.data.locationResult
        this.data.locationResult = []
        this.data.locationResult.push(tmp[0])
        this.data.locationResult.push(tmp[1])
        this.data.locationResult.push(e.currentTarget.dataset.name)

        this.setData({
            address: '',
            countryName: e.currentTarget.dataset.name,
            countryId: e.currentTarget.dataset.adcode,
            isShowMap: e.currentTarget.dataset.adcode === '222401' ? true : false, // 연길시인 경우 지도검색
            addressDetail: '',
            houseNo: '',
            gpsInfo: e.currentTarget.dataset.adcode === '222401' ? this.data.gpsInfo : '',
            locationResult: this.data.locationResult
        })

        this.data.locationResult.filter((res) => {
            this.data.address += res + ' '
            this.setData({
                address: this.data.address
            })
        })

        this.setHideOverlay()
    },
    setInputValue: function (e) {
        if (e.currentTarget.dataset.index === 'addr') {
            this.setData({
                houseNo: e.detail.value
            })
        }

        if (e.currentTarget.dataset.index === 'name') {
            this.setData({
                userName: e.detail.value
            })
        }

        if (e.currentTarget.dataset.index === 'phone') {
            this.setData({
                phoneNum: e.detail.value
            })
        }
    },
    // 해당 배송지를 디폴트로 설정하기 위한 스위치
    setChangeSwitch: function (e) {
        this.setData({
            isAddressDefault: e.detail.value
        })
    },
    endToast: function (e) {
        this.setData({
            isShowToast: false
        })
    },
    // 지역선택 툴 로출
    setShowLocationTool: function () {
        this.setInitDeliveryView()
    },
    // 백그라운드 오버레이 숨기기 설정
    setHideOverlay: function (e) {
        this.setData({
            isShowOverlay: false,
            isShowLocationTool: false
        })
    },
    // 지역선택 툴 로출 할 때 설정
    setInitDeliveryView: function () {
        let position = 0

        // 이미전에 배송주소가 설정이 되였다면 해당 배송주소를 가리키도록 스와이프 이동
        if (this.data.locationResult[2]) {
            position = 2
            // 구가 정해져있다면
            this.data.countryData.filter((res, idx) => {
                if (res.name === this.data.locationResult[2]) {
                    const tmp = this.data.countryData[idx]
                    this.data.countryData[idx] = this.data.countryData[0]
                    this.data.countryData[0] = tmp
                    this.setData({
                        countryData: this.data.countryData
                    })
                }
            })
        } else if (this.data.locationResult[1]) {
            position = 1
            // 시가 정해져있다면
            this.data.cityData.filter((res, idx) => {
                if (res.name === this.data.locationResult[1]) {
                    const tmp = this.data.cityData[idx]
                    this.data.cityData[idx] = this.data.cityData[0]
                    this.data.cityData[0] = tmp
                    this.setData({
                        cityData: this.data.cityData
                    })
                }
            })
        } else {
            position = 0
            // 성, 시, 구가 정해져있지 않다면 처음 위치
            this.data.provinceData.filter((res, idx) => {
                if (res.name === this.data.locationResult[0]) {
                    const tmp = this.data.provinceData[idx]
                    this.data.provinceData[idx] = this.data.provinceData[0]
                    this.data.provinceData[0] = tmp
                    this.setData({
                        provinceData: this.data.provinceData
                    })
                }
            })
        }

        this.setData({
            isShowLocationTool: true,
            isShowOverlay: true,
            activeItem: this.data.locationResult[position],
            currPos: position,
            scrollTop: 0
        })
    }
})
