/**
 * 处理好友关系模块
 * by: Peter
 */
const {
    Friendship
} = require("wechaty");
/**
 * 自动同意好友请求,并发送欢迎消息！
 */
async function onFriendship(friendship) {
    if (friendship.type() === Friendship.Type.Receive) {
        await friendship.accept();
        const contact = friendship.contact();
        const name = contact.name();
        console.log(`received friend event from ${name}`);
        await contact.say("你好啊" + name + "，欢迎联系早鸟，请大概介绍一下你寄几");
    }
}
module.exports = onFriendship