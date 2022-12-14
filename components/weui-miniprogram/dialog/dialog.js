var globalThis = this,
    self = this
module.exports = require('../_commons/0.js')([
    {
        ids: [7],
        modules: {
            149: function (t, e) {
                Component({
                    options: { multipleSlots: !0, addGlobalClass: !0 },
                    properties: {
                        title: { type: String, value: '' },
                        content: { type: String, value: '' },
                        extClass: { type: String, value: '' },
                        maskClosable: { type: Boolean, value: !0 },
                        mask: { type: Boolean, value: !0 },
                        show: { type: Boolean, value: !1, observer: '_showChange' },
                        buttons: { type: Array, value: [] },
                        index: { type: String, value: '' }
                    },
                    data: { innerShow: !1 },
                    ready: function () {
                        var t = this.data.buttons,
                            e = t.length
                        t.forEach(function (t, a) {
                            t.className = 1 === e ? 'weui-dialog__btn_primary' : 0 === a ? 'weui-dialog__btn_default' : 'weui-dialog__btn_primary'
                        }),
                            this.setData({ buttons: t })
                    },
                    methods: {
                        buttonTap: function (t) {
                            var e = t.currentTarget.dataset.index
                            this.triggerEvent('buttontap', { index: e, item: this.data.buttons[e] }, {})
                        },
                        close: function () {
                            if (this.properties.index !== 'pay') {
                                this.data.maskClosable && (this.setData({ show: !1 }), this.triggerEvent('close', {}, {}))
                            }
                        },
                        stopEvent: function () {}
                    }
                })
            },
            15: function (t, e, a) {
                t.exports = a(149)
            }
        },
        entries: [[15, 0]]
    }
])
