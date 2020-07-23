const bot = require("../app.js");
const { UrlLink } = require("wechaty");
const path = require("path");
const { FileBox } = require("file-box");
const superagent = require("../superagent");
const config = require("../config");
const { colorRGBtoHex, colorHex } = require("../utils");

const allKeywords = `回复序号或关键字获取对应服务
1.加入${config.WEBROOM}群聊
2.求职信息
3.海外疫情
如需创建群聊，请输入"创建群聊-"+群名称（例：创建群聊-早鸟求职群1）`;

/**
 * sleep
 * @param {*} ms
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/**
 * 处理消息
 */
async function onMessage(msg) {
    //防止自己和自己对话
    if (msg.self()) return;
    const room = msg.room(); // 是否是群消息
    if (room) {
        //处理群消息
        await onWebRoomMessage(msg);
    } else {
        //处理用户消息  用户消息暂时只处理文本消息。后续考虑其他
        const isText = msg.type() === bot.Message.Type.Text;
        if (isText) {
            await onPeopleMessage(msg);
        }
    }
}
/**
 * 处理用户消息
 */
async function onPeopleMessage(msg) {
    //获取发消息人
    const contact = msg.from();
    //对config配置文件中 ignore的用户消息不必处理
    if (config.IGNORE.includes(contact.payload.name)) return;
    let content = msg.text().trim(); // 消息内容 使用trim()去除前后空格

    if (content === "菜单") {
        await delay(200);
        await msg.say(allKeywords);
    } else if (content === "打赏") {
        //这里换成自己的赞赏二维码
        const fileBox = FileBox.fromFile(path.join(__dirname, "../imgs/pay.png"));
        await msg.say("我是秦始皇，打钱!!!!!");
        await delay(200);
        await msg.say(fileBox);
    } else if (content === config.WEBROOM || parseInt(content) === 1) {
        const webRoom = await bot.Room.find({
            topic: config.WEBROOM
        });
        if (webRoom) {
            try {
                await delay(200);
                await webRoom.add(contact);
                await delay(500);
                await webRoom.say('欢迎@' + contact.name() + ', 自我介绍一下然后看下群公告');
            } catch (e) {
                console.error(e);
            }
        }
    } else if (content.indexOf('创建群聊-') != -1) {
        let groupName = content.substring(5);
        console.log("groupName is " + groupName);
        const helperContactA = await bot.Contact.find({ name: 'CP' }); // change 'juxiaomi' to any contact in your wechat
        //const helperContactB = await bot.Contact.find({ name: 'LMA' });
        const contactList = [helperContactA, contact];
        console.log('Bot', 'contactList: %s', contactList.join(','));
        const room = await bot.Room.create(contactList, groupName).catch(e => console.error(e));
        console.log('Bot', 'createDingRoom() new ding room created: %s', room);
        await room.sync();
        await room.topic(groupName);
        await room.say(groupName + '- created');
        await delay(200);

        const qrcode = require('qrcode');
        const qrOption = {
            margin: 7,
            width: 175
        };
        const bufferImage = await qrcode.toDataURL(room.qrcode().toString(), qrOption);
        //let code = qr.image(room.qrcode().toString(), { type: 'png' });
        //await msg.say(room.qrcode());
        //const fileBox = FileBox.fromFile(code);        
        //const fileBox = FileBox.fromFile(path.join(__dirname, "../imgs/pay.png"));
        //await msg.say("这是您创建的群聊二维码");
        await delay(200);
        console.log(bufferImage);
        await msg.say(bufferImage);
        //await msg.say(fileBox);
    } else if (content === "求职信息" || parseInt(content) === 2) {
        let jobInfo = await superagent.getJobInfo();
        await delay(200);
        await msg.say(jobInfo);
    } else if (content === "海外疫情" || parseInt(content) === 3) {
        let res = await superagent.getOverseaCovid();
        await delay(200);
        await msg.say(res);
    } else if (content === "艾特网" || content === "导航站") {
        //发送链接卡片  web版协议不可用。
        const urlLink = new UrlLink({
            description: "来了来了，专为程序员量身定做的导航站来了！",
            thumbnailUrl: "https://www.iiter.cn/_nuxt/img/f996b71.png",
            title: "艾特网 - 程序员专用导航站",
            url: "https://iiter.cn"
        });
        await msg.say(urlLink);
    } else if (content === "客服") {
        const contactCard = await bot.Contact.find({ alias: config.MYSELF }); // change 'lijiarui' to any of the room member
        await msg.say(contactCard);
    } else {
        const noUtils = await onUtilsMessage(msg);
        if (noUtils) {
            await delay(200);
            await msg.say(allKeywords);
        }
    }
}
/**
 * 处理群消息
 */
async function onWebRoomMessage(msg) {
    const isText = msg.type() === bot.Message.Type.Text;
    if (isText) {
        const content = msg.text().trim(); // 消息内容
        if (content === "求职信息" || parseInt(content) === 2) {
            let jobInfo = await superagent.getJobInfo();
            await delay(200);
            await msg.say(jobInfo);
        } else if (content === "海外疫情" || parseInt(content) === 3) {
            let res = await superagent.getOverseaCovid();
            await delay(200);
            await msg.say(res);
        } else if (content.includes("踢@")) {
            // 踢人功能  群里发送  踢@某某某  即可
            const room = msg.room();
            //获取发消息人
            const contact = msg.from();
            const alias = await contact.alias();
            //如果是机器人好友且备注是自己的大号备注  才执行踢人操作
            if (contact.friend() && alias === config.MYSELF) {
                const delName = content.replace("踢@", "").trim();
                const delContact = await room.member({ name: delName });
                await room.del(delContact);
                await msg.say(delName + "已被移除群聊。且聊且珍惜啊！");
            }
            // @用户
            // const room = msg.room();
            // const members = await room.memberAll(); //获取所有群成员
            // const someMembers = members.slice(0, 3);
            // await room.say("Hello world!", ...someMembers); //@这仨人  并说 hello world
        } else {
            await onUtilsMessage(msg);
        }
    }
}

/**
 * utils消息处理
 */
async function onUtilsMessage(msg) {
    const contact = msg.from(); // 发消息人
    const isText = msg.type() === bot.Message.Type.Text;
    if (isText) {
        return true;
        //TODO
        return true;
    } else {
        return true;
    }
}
module.exports = onMessage;