var globalThis = this,
    self = this
module.exports = require('../_commons/0.js')([
    {
        ids: [17],
        modules: {
            3: function (t, e, a) {
                t.exports = a(57)
            },
            57: function (t, e) {
                Component({
                    options: { multipleSlots: !0, addGlobalClass: !0 },
                    properties: {
                        extClass: { type: String, value: '' },
                        title: { type: String, value: '' },
                        background: { type: String, value: '' },
                        color: { type: String, value: '' },
                        back: { type: Boolean, value: !0 },
                        loading: { type: Boolean, value: !1 },
                        animated: { type: Boolean, value: !0 },
                        show: { type: Boolean, value: !0, observer: '_showChange' },
                        delta: { type: Number, value: 1 },
                        isShowSearch: {
                            type: Boolean,
                            value: false,
                            observer() {
                                this.setData({}, this.showSearchChange)
                            }
                        },
                        titleCenter: { type: Boolean, value: true },
                        rightBtn: { type: Boolean, value: false },
                        isRightBtnStatus: { type: Boolean, value: false, observer: 'initRightBtn' },
                        btnText: { type: String, value: '' }
                    },
                    data: { displayStyle: '', animateNav: null, animateSearch: null, isRightBtn: false },
                    attached: function () {
                        var t = this,
                            e = !!wx.getMenuButtonBoundingClientRect,
                            a = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
                        wx.getSystemInfo({
                            success: function (n) {
                                const info = wx.getSystemInfoSync()
                                const other = info.windowWidth >= 320 && info.windowWidth < 375 ? 36 : 0
                                var i = !!(n.system.toLowerCase().search('ios') + 1)
                                t.setData({
                                    ios: i,
                                    statusBarHeight: n.statusBarHeight,
                                    innerWidth: e ? 'width:'.concat(a.left, 'px') : '',
                                    innerPaddingRight: e ? 'padding-right:'.concat(n.windowWidth - a.left, 'px') : '',
                                    leftWidth: e && t.properties.titleCenter ? 'width:'.concat(n.windowWidth - a.left - other, 'px') : 'width: 20px'
                                })
                            }
                        })
                    },
                    methods: {
                        _showChange: function (t) {
                            var e = ''
                            ;(e = this.data.animated ? 'opacity: '.concat(t ? '1' : '0', ';-webkit-transition:opacity 0.5s;transition:opacity 0.5s;') : 'display: '.concat(t ? '' : 'none')), this.setData({ displayStyle: e })
                        },
                        back: function () {
                            var t = this.data
                            wx.navigateBack({
                                delta: t.delta,
                                fail: function (e) {
                                    wx.reLaunch({ url: '/pages/main/main' })
                                }
                            })
                        },
                        showSearchChange: function () {
                            wx.createSelectorQuery()
                                .selectAll('.search-content')
                                .boundingClientRect(() => {
                                    const anim = wx.createAnimation({
                                        duration: 500,
                                        timingFunction: 'linear'
                                    })

                                    if (this.properties.isShowSearch) {
                                        anim.opacity(1).step()
                                    } else {
                                        anim.opacity(0).step()
                                    }

                                    this.setData({
                                        animateSearch: anim.export()
                                    })
                                })
                                .exec()

                            wx.createSelectorQuery()
                                .selectAll('.navigator-bar')
                                .boundingClientRect(() => {
                                    const anim = wx.createAnimation({
                                        duration: 500,
                                        timingFunction: 'linear'
                                    })

                                    if (this.properties.isShowSearch) {
                                        anim.opacity(0).step()
                                    } else {
                                        anim.opacity(1).step()
                                    }

                                    this.setData({
                                        animateNav: anim.export()
                                    })
                                })
                                .exec()
                        },
                        setBtnRight: function () {
                            this.setData({
                                isRightBtn: !this.data.isRightBtn
                            })
                            this.triggerEvent('actiontap', this.data.isRightBtn)
                        },
                        initRightBtn: function () {
                            this.setData({
                                isRightBtn: false
                            })
                        }
                    }
                })
            }
        },
        entries: [[3, 0]]
    }
])
