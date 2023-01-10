const formatTime = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = (n) => {
    n = n.toString()
    return n[1] ? n : `0${n}`
}

/**
 *
 * @param {string length} number
 */
function generateRandomString(number) {
    let ret = ''
    const character = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let index = 0; index < number; index++) {
        ret += character.charAt(Math.floor(Math.random() * character.length))
    }

    return ret
}

/**
 * 날자형식 정의(yyyy/mm/dd or yyyy-mm-dd)
 *
 * @param {날자} date
 * @param {인덱스} index(- or /)
 */
function formatDate(date, index) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return year + index + numberPad(month, 2) + index + numberPad(day, 2)
}

/**
 * 小程序 토스트
 *
 * @param {메시지 내용} value
 * @param {토스트용 아이콘} icon
 * @param {토스트용 이미지} img
 * @param {토스트 로출지연시간} duration
 * @param {마스크설정값} mask
 */
function showToast(value, icon, img, duration, mask) {
    if (img !== '') {
        wx.showToast({
            image: img,
            title: value,
            duration: duration,
            mask: mask
        })
    } else {
        wx.showToast({
            icon: icon,
            title: value,
            duration: duration,
            mask: mask
        })
    }
}

/**
 * 3자리마다 콤마 추가
 *
 * @param {콤마를 추가할 값} value
 */
function addComma(value) {
    return (
        value
            .toString()
            .split('.')[0]
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (value.toString().split('.')[1] ? '.' + value.toString().split('.')[1] : '')
    )
}

/**
 * 문자렬에서 콤마 제거
 *
 * @param {콤마를 제거할 값} value
 */
function removeComma(value) {
    return parseInt(value.replace(/,/g, ''))
}

/**
 * 문자렬 앞에 0 추가
 * @param {입력값} n
 * @param {문자렬 길이} width
 */
function numberPad(n, width) {
    n = n + ''
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n
}

/**
 * 선택된 html요소의 스크롤여부 판단
 *
 * @param {html 요소} selector
 * @param {스크롤 높이값} scrollTop
 */
function isCheckScroll(selector, scrollHeight) {
    return new Promise((resolve) => {
        const query = wx.createSelectorQuery()
        query.select(selector).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
            resolve(res[1].scrollTop > scrollHeight ? true : false)
        })
    })
}

/**
 *
 * @param {html 요소} selector
 */
function getElementProperties(selector) {
    return new Promise((resolve) => {
        const query = wx.createSelectorQuery()
        query.select(selector).boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec((res) => {
            resolve(res)
        })
    })
}

/**
 * 특정의 html요소 정의
 *
 * @param {html 요소} selector
 */
function getElementValue(selector, cb) {
    wx.createSelectorQuery().selectAll(selector).boundingClientRect(cb).exec()
}

function waitGetStorageWithTimeOut(key, timeout, pollInterval) {
    let loadFinishOk = false
    let elapsed = 0
    let data

    return new Promise((resolve, reject) => {
        while (!loadFinishOk && elapsed < timeout) {
            data = wx.getStorageSync(key)
            loadFinishOk = data !== '' ? true : false

            if (!loadFinishOk) {
                elapsed += pollInterval
            }
        }

        if (data !== '') {
            resolve(data)
        } else {
            resolve('')
        }
    })
}

/**
 * 상품개수에 따르는 상품가격계산 시 류동소수점 처리 함수
 *
 * @param {상품가격1} value1
 * @param {상품가격2} value2
 * @param {상품개수} quantity
 * @param {증가/감소} index
 */
function setCalculatePriceAndQuantity(value1, value2, quantity, index) {
    if (value1.toString().indexOf('.') !== -1) {
        const temp = value1.toString().split('.')[1]
        quantity = quantity === '' ? 1 : parseInt(quantity)

        if (temp.length === 1) {
            return index === 'plus' ? (parseInt(parseFloat(value1) * 10) * parseInt(quantity)) / 10 : (parseInt(parseFloat(value2) * 10) - parseInt(parseFloat(value1) * 10)) / 10
        } else if (temp.length === 2) {
            return index === 'plus' ? (parseInt(parseFloat(value1) * 100) * parseInt(quantity)) / 100 : (parseInt(parseFloat(value2) * 100) - parseInt(parseFloat(value1) * 100)) / 100
        }
    } else {
        return index === 'plus' ? parseInt(value1) * parseInt(quantity) : parseInt(value2) - parseInt(value1)
    }
}

/**
 * 공유활성 설정
 *
 */
function setEnableShareWechat() {
    if (wx.showShareMenu) {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    }
}

/**
 * 공유비활성 설정
 *
 */
function setDisableShareWechat() {
    if (wx.hideShareMenu) {
        wx.hideShareMenu({
            menus: ['shareAppMessage', 'shareTimeline']
        })
    }
}

/**
 * 小程序 QR 코드 스캔을 할 때 입력되는 파라메터 처리 함수
 *
 */
function getQueryString(url, name) {
    const reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
    const r = url.substr(1).match(reg)

    if (r != null) {
        return r[2]
    }
    return null
}

/**
 * 휴식일 팝업 시간계산
 *
 */
function setCalcTimeNotice(startdate, enddate, today, showDate) {
    const todayDate = new Date()
    const compareStartDate = new Date(startdate)
    const compareEndDate = new Date(enddate)

    if (todayDate >= compareStartDate && todayDate <= compareEndDate && showDate !== today) {
        return true
    }

    return false
}

/**
 * Gray 표시 시간계산
 *
 */
function setCalcTimeGrayLayout(startdate, enddate) {
    const todayDate = new Date()
    const compareStartDate = new Date(startdate)
    const compareEndDate = new Date(enddate)

    if (todayDate >= compareStartDate && todayDate <= compareEndDate) {
        return true
    }

    return false
}

/**
 * 방문 ACCESS ID 할당
 *
 */
function setVisitAccessId() {
    const todayDate = formatDate(new Date(), '/')
    const accessId = wx.getStorageSync('visit_id')
    const compareDate = wx.getStorageSync('visit_date')

    if (accessId === '' || accessId === null || accessId === undefined) {
        wx.setStorageSync('visit_id', 'm' + generateRandomString(32))
        wx.setStorageSync('visit_date', formatDate(new Date(), '/'))
    } else if (todayDate !== compareDate) {
        wx.setStorageSync('visit_id', 'm' + generateRandomString(32))
        wx.setStorageSync('visit_date', formatDate(new Date(), '/'))
    }
}

module.exports = {
    formatTime,
    showToast,
    addComma,
    removeComma,
    numberPad,
    isCheckScroll,
    waitGetStorageWithTimeOut,
    getElementValue,
    getElementProperties,
    setCalculatePriceAndQuantity,
    setEnableShareWechat,
    setDisableShareWechat,
    formatDate,
    getQueryString,
    setCalcTimeNotice,
    generateRandomString,
    setVisitAccessId,
    setCalcTimeGrayLayout
}
