var globalThis = this,
    self = this
module.exports = require('../_commons/0.js')([
    {
        ids: [15],
        modules: {
            101: function (e, t) {
                Component({
                    options: { addGlobalClass: !0 },
                    properties: { extClass: { type: String, value: '' }, show: { type: Boolean, value: !0 }, animated: { type: Boolean, value: !1 }, duration: { type: Number, value: 350 }, type: { type: String, value: 'dot-gray' }, tips: { type: String, value: '加载中' } }
                })
            },
            9: function (e, t, o) {
                e.exports = o(101)
            }
        },
        entries: [[9, 0]]
    }
])
