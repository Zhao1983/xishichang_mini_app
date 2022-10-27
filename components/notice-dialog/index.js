// components/notice-dialog/index.js
const util = require('../../utils/util.js')
const app = getApp()

Component({
    properties: {
        isShowDialog: {
            type: Boolean,
            value: false
        }
    },
    data: {
        background: ''
    },
    ready() {},
    attached() {},
    detached() {},
    methods: {
        setAction: function (e) {
            this.triggerEvent('notice', e.currentTarget.dataset.index)
        }
    }
})
