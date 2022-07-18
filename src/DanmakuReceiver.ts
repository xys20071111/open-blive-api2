import { WebSocket } from 'ws';
import { EventEmitter } from 'events';
import * as zlib from 'zlib';

enum DANMAKU_PROTOCOL {
    JSON = 0,
    HEARTBEAT,
    ZIP,
    BROTLI
}

enum DANMAKU_TYPE {
    HEARTBEAT = 2,
    HEARTBEAT_REPLY = 3,
    DATA = 5,
    AUTH = 7,
    AUTH_REPLY = 8
}

export class DanmakuReceiver extends EventEmitter {
    private socket: WebSocket | null = null;
    private url: string
    private authBody: string
    constructor(url: string, authBody: string) {
        super();
        this.url = url;
        this.authBody = authBody
    }

    public async connect() {
        // 现在不用自己去单独请求了
        this.socket = new WebSocket(this.url);
        this.socket.on('message', this.danmakeProcesser.bind(this));
        this.socket.on('close', () => {
            this.emit('close');
        });
        this.socket.on('open', async () => {
            // 生成并发送验证包
            const authPacket = this.generatePacket(1, 7, this.authBody);
            if (this.socket) {
                this.socket.send(authPacket);
            }
        });
        this.socket.on('error', () => {
            console.log('与弹幕服务器之间的连接发生错误')
            this.emit('close');
        });
    }

    private generatePacket(protocol: number, type: number, payload: string | Buffer): Buffer {
        let packet = Buffer.alloc(16 + Buffer.byteLength(payload));
        packet.writeInt32BE(16 + Buffer.byteLength(payload), 0); // 总长度
        packet.writeInt16BE(16, 4); // 头长度
        packet.writeUInt16BE(protocol, 6); // 协议类型
        packet.writeUInt32BE(type, 8); // 包类型
        packet.writeUInt32BE(1, 12); // 一个常数
        if (typeof payload === 'string') {
            packet.write(payload, 16); // 数据体
        } else {
            packet = Buffer.concat([packet, payload]);
        }
        return packet;
    }

    private danmakeProcesser(msg: Buffer) {
        // 弹幕事件处理
        const packetProtocol = msg.readInt16BE(6);
        const packetType = msg.readInt32BE(8);
        const packetPayload: Buffer = msg.slice(16);
        let jsonData: any;
        switch (packetType) {
            case DANMAKU_TYPE.HEARTBEAT_REPLY:
                // 心跳包，不做处理
                break;
            case DANMAKU_TYPE.AUTH_REPLY:
                // 认证通过，每30秒发一次心跳包
                setInterval(() => {
                    const heartbeatPayload = '你所热爱的，就是你的生活\n你 妈什么时候死啊';
                    if (this.socket) {
                        this.socket.send(this.generatePacket(1, 2, heartbeatPayload));
                    }
                }, 30000);
                this.emit('connected')
                break;
            case DANMAKU_TYPE.DATA:
                switch (packetProtocol) {
                    case DANMAKU_PROTOCOL.JSON:
                        // 这些数据大都没用，但还是留着吧
                        jsonData = JSON.parse(packetPayload.toString('utf-8'));
                        this.emit(jsonData.cmd, jsonData.data);
                        break;
                    case DANMAKU_PROTOCOL.BROTLI:
                        zlib.brotliDecompress(packetPayload, (err, result) => {
                            if (err) {
                                console.warn(err);
                            }
                            let offset = 0;
                            while (offset < result.length) {
                                const length = result.readUInt32BE(offset);
                                const packetData = result.slice(offset + 16, offset + length);
                                const jsonString = packetData.toString('utf8');
                                const data = JSON.parse(jsonString);
                                this.emit(data.cmd, (data.info || data.data));
                                offset += length;
                            }
                        });
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }

    public close(): void {
        if (this.socket) {
            this.socket.close();
            this.emit('close');
        }
    }
}
