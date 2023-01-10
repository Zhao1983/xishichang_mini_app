/*************** 西市場官方商城 서버 호출 URL ***************/

module.exports = {
    // SERVER_URL: 'http://192.168.1.216:9904/', // 로컬서버URL
    // SERVER_URL: 'https://ts.yjxishi.com:9904/', // 테스트서버URL
    SERVER_URL: 'https://yjxishi.com:9904/', // 운영서버 URL
    // AUTH_URL: 'https://tw.yjxishi.com/', // 微信로그인 URL(테스트)
    AUTH_URL: 'https://wx.yjxishi.com/', // 微信로그인 URL(운영)
    START_DATE: '2022/03/19 13:00:00', // 알림시작날자
    END_DATE: '2022/03/26 23:59:59', // 알림마감날자
    START_GRAY_LAYOUT_DATE: '2022/12/04 00:00:00', // 흑백색레이아웃시작날자
    END_GRAY_LAYOUT_DATE: '2022/12/06 23:59:59' // 흑백색레이아웃마감날자
}
