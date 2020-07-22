/*
 * @Author: Peter 
 * @Description:  登录
 * @Date: 2020-07-21 14:11:28 
 * @Last Modified by:   Peter 
 * @Last Modified time: 2020-07-21 14:11:28 
 */
async function onScan(qrcode, status) {
    require('qrcode-terminal').generate(qrcode, { small: true })

    const qrcodeImageUrl = [
        'https://api.qrserver.com/v1/create-qr-code/?data=',
        encodeURIComponent(qrcode),
    ].join('')

    console.log(status, qrcodeImageUrl)
}

module.exports = onScan