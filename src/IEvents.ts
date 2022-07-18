import { IAnchorInfo } from './IAnchorInfo'

interface IDanmaku {
    room_id: number//弹幕接收的直播间
    uid: number//用户UID
    uname: string//用户昵称
    msg: string//弹幕内容
    msg_id: string//消息唯一id
    fans_medal_level: number//对应房间勋章信息
    fans_medal_name: string
    fans_medal_wearing_status: boolean//当前佩戴的粉丝勋章佩戴状态
    guard_level: number//对应房间大航海 1总督 2提督 3舰长
    timestamp: number//弹幕发送时间秒级时间戳
    uface: string//用户头像   
}

interface IGift {
    room_id: number//直播间(演播厅模式则为演播厅直播间非演播厅模式则为收礼直播间)
    uid: number//送礼用户UID
    uname: string//送礼用户昵称
    uface: string//送礼用户头像
    gift_id: number//道具id(盲盒:爆出道具id)
    gift_name: string//道具名(盲盒:爆出道具名)
    gift_num: number//赠送道具数量
    price: number//支付金额(1000 = 1元 = 10电池)盲盒:爆出道具的价值
    paid: boolean//是否是付费道具
    fans_medal_level: number//实际收礼人的勋章信息
    fans_medal_name: string //粉丝勋章名
    fans_medal_wearing_status: boolean//当前佩戴的粉丝勋章佩戴状态
    guard_level: number//room_id对应的大航海等级
    timestamp: number//收礼时间秒级时间戳
    msg_id: string//消息唯一id
    anchor_info: IAnchorInfo
}

interface ISuperChat {
    room_id: number//直播间id
    uid: number//购买用户UID
    uname: string//购买的用户昵称
    uface: string//购买用户头像
    message_id: number//留言id(风控场景下撤回留言需要)
    message: string//留言内容
    msg_id: string//消息唯一id
    rmb: number//支付金额(元)
    timestamp: number//赠送时间秒级
    start_time: number//生效开始时间
    end_time: number//生效结束时间
    guard_level: number //对应房间大航海登记    (新增) 
    fans_medal_level: number //对应房间勋章信息  (新增) 
    fans_medal_name: string //对应房间勋章名字  (新增) 
    fans_medal_wearing_status: boolean//当前佩戴的粉丝勋章佩戴状态(新增)
}

interface ISuperChatDel {
    room_id: number//直播间id
    message_ids: Array<number>// 留言id
    msg_id: string//消息唯一id
}

interface IGuard {
    user_info: IAnchorInfo
    guard_level: number //对应的大航海等级 1总督 2提督 3舰长
    guard_num: null
    guard_unit: string // (个月)
    fans_medal_level: number //粉丝勋章等级
    fans_medal_name: string //粉丝勋章名
    fans_medal_wearing_status: boolean //当前佩戴的粉丝勋章佩戴状态
    timestamp: number
    room_id: number
    msg_id: string//消息唯一id
}

export { IDanmaku, IGift, IGuard, ISuperChat, ISuperChatDel }