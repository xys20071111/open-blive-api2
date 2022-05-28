import EventEmitter from "events"
import { BLiveApi } from "./BLiveApi"
import { DanmakuReceiver } from "./DanmakuReceiver"

interface GameInfo {
    game_id: string
}

interface WebSocketInfo {
    auth_body: string
    wss_link: Array<string>
}

interface InteractiveInfo {
    game_info: GameInfo
    websocket_info: WebSocketInfo
}

export class InteractiveInstence extends EventEmitter {
    private readonly appId: number
    private readonly liverId: string
    private danmakuReceiverInstence: DanmakuReceiver | null = null
    private gameId: string | null = null
    private requester: BLiveApi
    constructor(appId: number, liverId: string, requester: BLiveApi) {
        super()
        this.appId = appId
        this.liverId = liverId
        this.requester = requester
    }
    public connect() {
        this.requester.request('/v2/app/start', {
            code: this.liverId,
            app_id: this.appId
        }).then((data: InteractiveInfo) => {
            this.gameId = data.game_info.game_id
            this.danmakuReceiverInstence = new DanmakuReceiver(data.websocket_info.wss_link[0], data.websocket_info.auth_body)
            this.danmakuReceiverInstence.connect()
            this.emit('connected')
        }).catch((code: number) => {
            this.emit('error', code)
        })
    }
    public getDanmakuReceiver(): DanmakuReceiver | null {
        return this.danmakuReceiverInstence
    }

    public getGameId(): string | null {
        return this.gameId
    }
}