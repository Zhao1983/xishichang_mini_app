// pages/mypage/notice/notice_detail/notice_detail.js

const api = require('../../../../utils/request.js')
const util = require('../../../../utils/util.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false,
        navTitle: '系统消息', // 뷰타이틀
        navBtnTitle: '清空', // 네비게이션 버튼타이틀
        isNavRightBtn: true,
        isEmpty: false,
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [{ text: '否' }, { text: '是' }],
        isDeviceHeight: app.globalData.isDeviceHeight,
        heightContent: 0, // 페지 높이값
        messageData: [], // 메세지 배렬
        isShowSheet: false // 메뉴툴로출여부
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: async function (options) {
        wx.setStorageSync('callMenuUrl', 'notice_detail')
        util.setDisableShareWechat()

        // 네비게이션높이 구하기
        const elementNavigation = await util.getElementProperties('#navigation')
        if (elementNavigation[0] !== null) {
            this.setData({
                heightContent: app.globalData.deviceInfo.windowHeight - elementNavigation[0].height
            })
        }

        this.getMessageData()
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
    getMessageData: function () {
        this.setData({
            pageLoading: true
        })

        api.request('msg').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    api.request('msg', {}, 'PUT').then((res) => {
                        if (res.action) {
                            this.setData({
                                pageLoading: false,
                                messageData: response.data,
                                isEmpty: response.data.length === 0 ? true : false,
                                isNavRightBtn: response.data.length !== 0 ? true : false
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
                }
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 삭제 처리
    setDeleteConfirm: function (e) {
        this.setData({
            isShowWarningDialog: false
        })

        // 삭제 취소인 경우
        if (e.detail.index === 0) {
            return
        }

        this.setData({
            pageLoading: true
        })

        api.request('msg', {}, 'DELETE').then((response) => {
            if (response.action) {
                this.setData({
                    pageLoading: false
                })
                this.getMessageData()
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 네비게이션 버튼 액션
    setRightBtn: function (e) {
        this.setData({
            isShowWarningDialog: true
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
    }
})
