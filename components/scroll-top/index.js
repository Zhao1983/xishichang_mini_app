// components/scroll-top/index.js
const util = require('../../utils/util.js')
const app = getApp()

Component({
    properties: {
        isShow: {
            type: Boolean,
            value: false,
            observer() {
                this.setData({}, this.initStatus) // 상태변화 감지하기
            }
        }
    },
    data: {
        animateData: null,
        isDeviceHeight: app.globalData.isDeviceHeight + 10
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        // 클릭시 스크롤 0으로 초기화
        goTop: function () {
            this.triggerEvent('topevent')
        },
        // 스크롤변화에 따르는 애니메이션 주기
        initStatus: function () {
            const animate = wx.createAnimation({
                duration: 300,
                timingFunction: 'linear'
            })

            util.getElementValue('.scroll-top', () => {
                if (this.properties.isShow) {
                    animate.translateY(-this.data.isDeviceHeight - 48).opacity(1).step()
                } else {
                    animate.translateY(0).opacity(0).step()
                }

                this.setData({
                    animateData: animate.export()
                })
            })
        }
    }
})
