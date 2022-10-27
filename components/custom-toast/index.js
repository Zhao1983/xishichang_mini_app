// components/custom-toast/index.js
const util = require('../../utils/util.js')

Component({
    properties: {
        isShowToast: {
            type: Boolean,
            value: false,
            observer: 'initAnimation'
        },
        duration: {
            type: Number,
            value: 3000
        },
        message: {
            type: String,
            value: ''
        }
    },
    data: {
        animateData: null
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        initAnimation: function () {
            if (this.properties.isShowToast) {
                const animate = wx.createAnimation({
                    duration: 300,
                    timingFunction: 'ease'
                })

                util.getElementValue('.custom-toast', () => {
                    animate.translateY(-70).opacity(1).step()
                    this.setData({
                        animateData: animate.export()
                    })
                })

                setTimeout(() => {
                    util.getElementValue('.custom-toast', () => {
                        animate.translateY(-70).opacity(0).step()
                        animate.translateY(55).step()
                        this.setData({
                            animateData: animate.export()
                        })
                    })

                    this.triggerEvent('endtoast', false)
                }, this.properties.duration)
            }
        }
    }
})
