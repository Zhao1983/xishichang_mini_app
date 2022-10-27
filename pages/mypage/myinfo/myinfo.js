// pages/mypage/myinfo/myinfo.js
const api = require('../../../utils/request.js')
const util = require('../../../utils/util.js')
const FormData = require('../../../utils/formdata/formData.js')
const app = getApp()

Page({
    /**
     * Page initial data
     */
    data: {
        pageLoading: false, // 로딩바 로출상태
        navTitle: '我的资料', // 네비게이션 타이틀
        isShowSheet: false, // 메뉴툴로출여부
        userAvatar: '', // 사용자아바타 이미지
        nickName: '', // 사용자명
        gender: '', // 성별
        birthday: '', // 생년월일
        phone: '', // 폰번호
        arrGender: ['男', '女'], // 성별배렬
        genderIndex: 0,
        date: '',
        isShowWarningDialog: false, // 경고다이얼로그 로출상태
        warningBtn: [{ text: '确认' }],
        isChangeAvatar: false, // 이미지 업로드상태값
        warningTitle: '' // 경고문자내용
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {},

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {},

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {
        if (!this.data.isChangeAvatar) {
            this.setData({
                pageLoading: true
            })
            this.getProfileData()
        }
    },

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
    // 사용자프로필 정보 얻기
    getProfileData: function () {
        api.request('profile').then((response) => {
            if (response.action) {
                if (response.data !== null) {
                    this.setData({
                        pageLoading: false,
                        userAvatar: response.data.avatar,
                        nickName: response.data.nick,
                        gender: response.data.gender,
                        birthday: response.data.birthday,
                        date: response.data.birthday === '' ? util.formatDate(new Date(), '-') : response.data.birthday,
                        phone: response.data.phone === '' ? '' : response.data.phone.slice(0, 3) + '****' + response.data.phone.slice(7, 11)
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
    chooseImage: function () {
        this.setData({
            isChangeAvatar: true
        })
        const that = this

        wx.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                // 업로드용이미지가 JPEG,PNG가 아니면 경고알림 띄우기
                if (res.tempFilePaths[0].split('.')[1] !== 'jpg' && res.tempFilePaths[0].split('.')[1] !== 'jpeg' && res.tempFilePaths[0].split('.')[1] !== 'JPEG' && res.tempFilePaths[0].split('.')[1] !== 'png') {
                    that.setShowWarningDialog('请选择PNG,JPG照片格式文件')
                    return
                }

                that.setData({
                    pageLoading: true
                })

                let formData = new FormData()
                formData.appendFile('file', res.tempFilePaths[0])
                const data = formData.getData()

                // 아바타이미지파일 업로드
                api.requestFileUpload('upload/avatar', data, 'POST').then((response) => {
                    if (response.action) {
                        if (response.data !== null) {
                            // 업로드를 한 이미지파일을 업데이트하기
                            const query = {
                                name: response.data.uri
                            }
                            api.request('profile/avatar', query, 'PUT').then((resp) => {
                                if (resp.action) {
                                    that.setData({
                                        pageLoading: false,
                                        userAvatar: res.tempFilePaths[0]
                                    })
                                } else {
                                    that.setData({
                                        pageLoading: false
                                    })
                                }
                            })
                        } else {
                            that.setData({
                                pageLoading: false
                            })
                        }
                    } else {
                        that.setData({
                            pageLoading: false
                        })
                    }
                })
            }
        })
    },
    // 성별 설정
    setChangeGender: function (e) {
        let value = ''
        let index = ''

        if (e.detail.value === '0') {
            value = '男'
            index = '1'
        }

        if (e.detail.value === '1') {
            value = '女'
            index = '2'
        }

        this.setData({
            pageLoading: true
        })

        const query = {
            name: index
        }

        api.request('profile/gender', query, 'PUT').then((response) => {
            if (response.action) {
                this.setData({
                    pageLoading: false,
                    genderIndex: parseInt(e.detail.value),
                    gender: value
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 생년월일설정
    setChangeBirthday: function (e) {
        this.setData({
            pageLoading: true
        })

        const query = {
            name: e.detail.value
        }

        api.request('profile/birthday', query, 'PUT').then((response) => {
            if (response.action) {
                this.setData({
                    pageLoading: false,
                    date: e.detail.value,
                    birthday: e.detail.value
                })
            } else {
                this.setData({
                    pageLoading: false
                })
            }
        })
    },
    // 경고다이얼로그 로출설정
    setShowWarningDialog: function (title) {
        this.setData({
            isShowWarningDialog: true,
            warningTitle: title
        })
    },
    // 경고다이얼로그 액션처리
    setConfirmWarningDialog: function (e) {
        this.setData({
            isShowWarningDialog: false
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
    },
    setRedirect: function (e) {
        this.setData({
            isChangeAvatar: false
        })

        if (e.currentTarget.dataset.index === 'create') {
            wx.navigateTo({
                url: '/pages/mypage/myinfo/phone_input/phone_input'
            })
        }

        if (e.currentTarget.dataset.index === 'update') {
            wx.navigateTo({
                url: '/pages/mypage/myinfo/phone_update/phone_update'
            })
        }
    }
})
