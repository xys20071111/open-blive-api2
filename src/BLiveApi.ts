import https from 'https'
import crypto from 'crypto'
import { v4 } from 'uuid'

interface IRequestInfomation {
	accessKeyId: string
	accessKeySecret: string,
	path: string
}

interface IResult {
	code: number
	message: string
	request_id: string
	data: any
}

export class BLiveApi {
	private readonly accessKeyId: string
	private readonly accessKeySecret: string
	constructor(accseeKeyId: string, accessKeySecret: string) {
		this.accessKeyId = accseeKeyId
		this.accessKeySecret = accessKeySecret
	}
	public request(path: string, body: object): Promise<any> {
		return request({
			accessKeyId: this.accessKeyId,
			accessKeySecret: this.accessKeySecret,
			path
		}, JSON.stringify(body))
	}
}

export function request(info: IRequestInfomation, body: string) {
	return new Promise((resolve, reject) => {
		const hmac = crypto.createHmac('sha256', info.accessKeySecret)
		const md5 = crypto.createHash('md5')
		const accesskeyid = info.accessKeyId
		const md5Hash = md5.update(body).digest('hex')
		const time = Math.floor(Date.now() / 1000)
		const randomNum = v4()
		const sign = {
			"x-bili-accesskeyid": accesskeyid,
			"x-bili-content-md5": md5Hash,
			"x-bili-signature-method": "HMAC-SHA256",
			"x-bili-signature-nonce": randomNum,
			"x-bili-signature-version": "1.0",
			"x-bili-timestamp": time,
		}
		let signString = ''
		for (const l in sign) {
			if (l === 'x-bili-timestamp') {
				signString += `${l}:${sign[l]}`
			} else {
				signString += `${l}:${sign[l]}\n`
			}
		}
		let req = https.request({
			host: 'live-open.biliapi.com',
			path: info.path,
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'x-bili-content-md5': md5Hash,
				'x-bili-timestamp': time,
				'x-bili-signature-method': 'HMAC-SHA256',
				'x-bili-signature-nonce': randomNum,
				'x-bili-accesskeyid': accesskeyid,
				'x-bili-signature-version': '1.0',
				'Authorization': hmac.update(signString).digest('hex')
			}
		})

		req.on('response', (res) => {
			res.setEncoding('utf-8')
			let jsonString = ''
			res.on('data', chunk => jsonString += chunk)
			res.on('end', () => {
				const result: IResult = JSON.parse(jsonString)
				if (result.code !== 0) {
					reject(result.code)
				} else {
					resolve(result.data)
				}
			})
		})

		req.write(body)
		req.end()
	})
}