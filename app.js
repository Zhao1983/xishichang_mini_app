// app.js
const api = require('./utils/request.js')
const util = require('./utils/util.js')

App({
    onLaunch() {
        // 앱 업데이트(새 버전이 출시되였으면 자동으로 새 버전으로 업데이트 진행)
        if (wx.getUpdateManager) {
            const updateManager = wx.getUpdateManager()

            if (updateManager) {
                updateManager.onCheckForUpdate((res) => {
                    if (res.hasUpdate) {
                        updateManager.onUpdateReady(() => {
                            wx.showModal({
                                title: '更新提示',
                                content: '新版本已经准备好，是否重启应用？',
                                success: (res) => {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            })
                        })
                    }
                })
            }
        }

        // 쇼핑몰 스토레이지정보 모두 초기화
        wx.removeStorageSync('siteinfo')
        wx.removeStorageSync('callMenuUrl')
        wx.removeStorageSync('cart_count')
        wx.removeStorageSync('pageCount')
        wx.removeStorageSync('deliveryid')
        wx.removeStorageSync('words')
        wx.removeStorageSync('token')
        this.setInitData()
        // accessId용
        util.setVisitAccessId()

        // 앱 하단 메뉴높이를 폰 높이에 따라 설정하기
        const info = wx.getSystemInfoSync()

        if (info.model) {
            this.globalData.isDeviceHeight = info.model.search('iPhone X') !== -1 ? 80 : 55
        }

        this.globalData.deviceInfo = info
    },
    // 장바구니에 담긴 상품수 얻기
    getCartCount() {
        return new Promise((resolve) => {
            if (wx.getStorageSync('token') !== '') {
                api.request('carts/num').then((response) => {
                    if (response.data !== null) {
                        wx.setStorageSync('cart_count', response.data)
                        resolve(true)
                    }
                })
            }
        })
    },
    async setInitData() {
        // 쇼핑몰토큰정보와 쇼핑몰정보 얻기
        const res = await api.request('token?key=')
        const freeData = await api.request('freeSettings')
        console.log(freeData)
        console.log(res.data)

        if (res !== null) {
            wx.setStorageSync('siteinfo', {
                ...res.data,
                freeEventShippingStatus: freeData.data.freeShippingDto ? freeData.data.freeShippingDto.status : '0',
                freeEventPackageStatus: freeData.data.freePackageDto ? freeData.data.freePackageDto.status : '0'
            })

            // 콜백호출용(onLaunch함수보다 메인페지의 onLoad함수가 먼저 호출되는 경우 리용)
            if (this.setInitDataCallback) {
                this.setInitDataCallback()
            }
        }
    },
    globalData: {
        isDeviceHeight: 0,
        deviceInfo: {}
    }
})
