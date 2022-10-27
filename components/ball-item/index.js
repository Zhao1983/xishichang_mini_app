// components/ball-item/index.js
const util = require('../../utils/util.js')
const app = getApp()

Component({
    properties: {
        balls: {
            type: Object,
            value: {},
            observer() {
                this.setData({}, this.startAnimation) // 상태변화 감지하기
            }
        },
        // 볼이 떨어지는 끝점(X값)
        pos_x: {
            type: Number,
            value: 0
        },
        // 볼이 떨어지는 끝점(Y값)
        pos_y: {
            type: Number,
            value: 0
        },
        // 볼의 첫위치
        ball_style: {
            type: Object,
            value: {}
        }
    },
    data: {
        left: '0', // 볼의 시작점(X값)
        top: '0', // 볼의 시작점(Y값)
        animBall: null,
        animInner: null,
        isClick: false
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        startAnimation: function () {
            if (this.properties.balls.show && !this.data.isClick) {
                const tempx = (app.globalData.deviceInfo.windowWidth * this.properties.ball_style.left) / 100
                const clientX = this.properties.balls.el.clientX - tempx
                this.setData({
                    isClick: true,
                    left: clientX,
                    top: this.properties.balls.el.clientY
                })

                util.getElementValue('.ball', () => {
                    const anim = wx.createAnimation({
                        duration: 600,
                        timingFunction: 'ease-in'
                    })

                    anim.top(app.globalData.deviceInfo.windowHeight - this.properties.pos_y).step()
                    this.setData({
                        animBall: anim.export()
                    })
                })

                util.getElementValue('.inner', () => {
                    const anim = wx.createAnimation({
                        duration: 600,
                        timingFunction: 'linear'
                    })

                    anim.left(this.properties.pos_x).step()
                    this.setData({
                        animInner: anim.export()
                    })
                })

                setTimeout(() => {
                    // 볼의 속성 초기화
                    this.properties.balls.show = false
                    this.properties.balls.el = null
                    this.triggerEvent('endballevent', this.properties.balls)
                    // 볼위치 초기화
                    this.setData({
                        left: '0',
                        top: '0',
                        animBall: null,
                        animInner: null,
                        isClick: false
                    })
                }, 610)
            }
        }
    }
})
