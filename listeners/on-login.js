const schedule = require("../schedule");
const config = require("../config");
const untils = require("../utils");
const superagent = require("../superagent");
const bot = require("../app");
/**
 * @description 您的机器人上线啦！
 * @param {} user
 */
async function onLogin(user) {
    console.log(`贴心小助理${user}登录了`);
    //创建定时发送群消息任务
    await onRoom();
}
/**
 * 9点定时给指定群发送消息
 */
async function onRoom() {
    //匹配规则可参考 schedule/index.js
    const time = "0 0 9 * * *";
    schedule.setSchedule(time, async() => {
        const room = await bot.Room.find({
            topic: config.WEBROOM
        });
        let today = await untils.formatDate(new Date()); //获取今天的日期
        let one = await superagent.getOne(); //获取每日一句
        const englishData = await superagent.getEnglishOne(); //英语一句话
        let english = `en：${englishData.en}\nzh：${englishData.zh}`;
        let poison = await superagent.getPoison(); //毒鸡汤
        let jobInfo = await superagent.getJobInfo(); //Job Info
        let overseaData = await superagent.getOverseaCovid(); //Oversea Covid data
        const str = `${today}\n元气满满的一天开始啦,要加油噢^_^\n\n求职信息：\n${jobInfo}\n\n海外疫情：\n${overseaData}`;
        await room.say(str);
    });
}
module.exports = onLogin;