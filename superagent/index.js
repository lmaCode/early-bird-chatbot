const superagent = require("../config/superagent");
const cheerio = require("cheerio");
const request = require("request");
const ONE = "http://wufazhuce.com/"; // ONE的web版网站
const POISON = "https://8zt.cc/"; //毒鸡汤网站
const TXHOST = "https://api.tianapi.com/txapi/"; // 天行host 官网：tianapi.com
const APIKEY = ""; // 天行key，请先去网站注册填写key  注册免费  注册后申请下面的接口即可。
var jobList = ["【早鸟职讯】我在招Tinder的ML人才，manager，tech lead，ML engineer的opening都有。有兴趣的同学给我发邮件 aibo.tian@gotinder.com #ML #manager #engineer 更多求职咨询请见 t.me/bayareaearlybird",
    "【早鸟职讯】Hi, 大家好， 我是Startup公司CortexData的co-founder, 公司目前在A轮，主要是在做大数据实时分析的SaaS解决方案，我们现在主要招Frontend/ Backend Software Engineer（java/cloud/distributed system/big data），有兴趣的同学可以加我微信或者给我发邮件 xiangfu@cortexdata.io, 现在暂时不接受H1B Transfer（疫情期间Transfer需要花3-6个月，小公司真的等不起￼）， 只招opt/绿卡/公民。\n#java #frontend #backend #bigdata\n更多求职咨询请见 t.me/bayareaearlybird",
    "【早鸟职讯】我们actively在招聘以下职位：\n - Software Engineer - Android/IOS, Mountain View\n - Web Developer - Mountain View\n - Frontend/Backend Engineer, Palo Alto\n - Senior Security Engineer, Palo Alto\n - Quant Developer, Palo Alto\n - Accountant, Boston\n - Bank Officer, San Francisco, Los Angeles\n - Marketing Manager, Santa Clara\n 或email resume至 career@flyhightalent.com 注明【湾区早鸟】+ 职位名\n 更多求职咨询请见 t.me/bayareaearlybird",
    "【早鸟职讯】We have several engineering and customer success positions open in our company now including Security Researcher, UI developers, UX designers and Tier3 Support Engineers. If you know anyone is interested, please contact me at cliu@stellarcyber.ai. Or visit our website at www.stellarcyber.ai Thank you\n #UI #security \n 更多求职咨询请见 t.me/bayareaearlybird"
];
/**
 * 获取每日一句
 */
async function getOne() {
    try {
        let res = await superagent.req(ONE, "GET");
        let $ = cheerio.load(res.text);
        let todayOneList = $("#carousel-one .carousel-inner .item");
        let todayOne = $(todayOneList[0])
            .find(".fp-one-cita")
            .text()
            .replace(/(^\s*)|(\s*$)/g, "");
        return todayOne;
    } catch (err) {
        console.log("错误", err);
        return err;
    }
}

function random(min, max) { return parseInt((max - min) * Math.random()); }

/**
 * 获取每日毒鸡汤
 */
async function getSoup() {
    try {
        let res = await superagent.req(POISON, "GET");
        let $ = cheerio.load(res.text);
        const content = $("#sentence").text();
        return content;
    } catch (err) {
        console.error("err");
        return err;
    }
}
/**
 * 获取海外肺炎数据
 */
async function getOverseaCovid() {
    const url = TXHOST + "ncovabroad/index";
    let resText = "世界疫情确诊人数排名前五的国家为：\n";
    try {
        let res = await superagent.req(url, "GET", {
            key: APIKEY
        });
        let content = JSON.parse(res.text);
        if (content.code === 200) {
            return resText + content.newslist[0].provinceName + '\n' + content.newslist[1].provinceName + '\n' + content.newslist[2].provinceName + '\n' + content.newslist[3].provinceName + '\n' + content.newslist[4].provinceName + '\n' + '\n' + "美国疫情数据如下：\n" + "确诊人数：" +
                content.newslist[0].confirmedCount + '\n' + "确诊人数排名：" +
                content.newslist[0].confirmedCountRank + '\n' + "治愈人数：" +
                content.newslist[0].curedCount + '\n' + "死亡人数：" + content.newslist[0].deadCount +
                '\n' + "死亡人数排名：" + content.newslist[0].deadCountRank + '\n' + "死亡率：" +
                content.newslist[0].deadRate + '\n' + "死亡率排名：" + content.newslist[0].deadRateRank;
        } else {
            console.log("获取接口失败", content.msg);
        }
    } catch (err) {
        console.log("获取接口失败", err);
    }
}


function getJobInfo() {
    var job = jobList[random(0, jobList.length - 1)];
    return job;
}

/**
 * 获取全国肺炎数据
 */
function getChinaFeiyan() {
    return new Promise((resolve, reject) => {
        request.get({
                url: `https://c.m.163.com/ug/api/wuhan/app/data/list-total?t=${new Date().getTime()}`
            },
            function(err, response) {
                if (err) {
                    reject(err);
                }
                const res = JSON.parse(response.body);
                resolve(res);
            }
        );
    });
}
/**
 * 获取省份肺炎数据
 */
async function getProvinceFeiyan(name) {
    return new Promise((resolve, reject) => {
        request.get({
                url: `https://gwpre.sina.cn/interface/fymap2020_data.json?t=${new Date().getTime()}`
            },
            function(err, response) {
                if (err) {
                    reject(err);
                }
                try {
                    const res = JSON.parse(response.body);
                    res.data.list.forEach(item => {
                        if (name === item.name) {
                            resolve(item);
                            return;
                        }
                    });
                } catch (error) {
                    reject(err);
                }
            }
        );
    });
}
/**
 * 获取神回复
 */
async function getGodReply() {
    const url = TXHOST + "godreply/index";
    try {
        let res = await superagent.req(url, "GET", {
            key: APIKEY
        });
        let content = JSON.parse(res.text);
        if (content.code === 200) {
            return content.newslist[0];
        } else {
            console.log("获取接口失败", content.msg);
        }
    } catch (err) {
        console.log("获取接口失败", err);
    }
}
/**
 * 每日英语一句话
 */
async function getEnglishOne() {
    const url = TXHOST + "ensentence/index";
    try {
        let res = await superagent.req(url, "GET", {
            key: APIKEY
        });
        let content = JSON.parse(res.text);
        if (content.code === 200) {
            return content.newslist[0]; //en英文  zh中文
        } else {
            console.log("获取接口失败", content.msg);
        }
    } catch (err) {
        console.log("获取接口失败", err);
    }
}
module.exports = {
    getOne,
    getSoup,
    getChinaFeiyan,
    getProvinceFeiyan,
    getGodReply,
    getOverseaCovid,
    getJobInfo,
    getEnglishOne
};