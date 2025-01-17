import unirest from "unirest";
import * as cheerio from "cheerio";
import { getUsers, getOrders, addOrder } from "./storage/index.js";

//12870856
//Popopo26
const SESSION_TOKEN = "fhpdjek5ij83oso8gcj802ria3";
const UNAUTHORIZED_TITLE = "����������������� �������";
const BLOCK_MESSAGE =
  "Аккаунт временно заблокирован по причине слишком частого обновления данной страницы.";
const ADMIN_CHAT_ID = "995509677";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const sendMessageForAll = async (bot, message) => {
  const users = getUsers();
  await users.forEach(async (userId) => {
    if (userId) {
      await bot.sendMessage(userId, message);
    }
  });
};

const getUrl = (tomorrow) => {
  const date = new Date().addHours(3);

  if (tomorrow) {
    date.addHours(24);
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `http://business.netboosters.ru/sched.php?date=${day}-${month}-${year}+${hours}%3A${minutes}`;
};

const getHtmlPage = async (url) => {
  let startTime = Date.now();
  const response = await unirest
    .get(url)
    // .header(
    //   "Accept",
    //   "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    // )
    // .header("Accept-Encoding", "gzip, deflate")
    // .header("Accept-Language", "ru-RU,ru;q=0.9")
    .header("Cache-Control", "max-age=0")
    // .header("Connection", "keep-alive")
    .header(
      "Cookie",
      `PHPSESSID=${SESSION_TOKEN}; _ym_uid=1737027183158660615; _ym_d=1737027183; _ym_isad=2; _ym_visorc=w`
    );
  // .header("Host", "business.netboosters.ru")
  // .header("Upgrade-Insecure-Requests", "1")
  // .header(
  //   "User-Agent",
  //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
  // );

  let endTime = Date.now();
  console.log(
    `${new Date(endTime).toLocaleString()} ${url} ${endTime - startTime}мс`
  );

  return response.body;
};

const parseOrders = async (bot, html) => {
  if (!html) return;

  if (html.indexOf(UNAUTHORIZED_TITLE) !== -1) {
    sendMessageForAll(
      bot,
      `Истекла сессия для токена ${SESSION_TOKEN}. Необходимо авторизоваться.`
    );
    return;
  }

  if (html.indexOf(BLOCK_MESSAGE) !== -1) {
    sendMessageForAll(
      bot,
      `Слишком частые обращения к серверу. Меня забанили. Жду две минуты.`
    );
    await sleep(120000);
    return;
  }

  const $ = cheerio.load(html);
  const orders = [];
  const table = $("table").eq(1);

  table.find("tr").each((index, element) => {
    if (index <= 1) return;
    const tds = $(element).find("td");
    orders.push({
      link: tds.eq(0).find("a").attr("href"),
      number: tds.eq(1).text(),
      time: tds.eq(2).text(),
      station: tds.eq(3).text(),
      cost: tds.eq(4).text(),
      description: tds.eq(5).text(),
      addr: tds.eq(6).text(),
      client: tds.eq(7).text(),
    });
  });

  return orders;
};

const buildOrderMessage = (order, isNew) => {
  const title = isNew ? "Новый заказ" : "Заказ";
  return (
    `${title} #${order.number}\n\t` +
    `Время начала заказа: ${order.time}\n\t` +
    `Метро: ${order.station}\n\t` +
    `Тип цены: ${order.cost}\n\t` +
    `\n\t` +
    `Описание проблемы: ${order.description}\n\t` +
    `\n\t` +
    `Адрес: ${order.addr}\n\t` +
    `Инфа о клиенте: ${order.client}\n\t` +
    `\n\t` +
    `ЗАБРАТЬ ЗАКАЗ: http://business.netboosters.ru${order.link}`
  );
};

const sendOrders = async (bot, orders, chatId, tomorrow) => {
  if (chatId && !orders?.length) {
    await bot.sendMessage(
      chatId,
      "В данный момент заявок нет или аккаунт заблокирован. Повторите попытку позже"
    );
  }

  await orders.forEach(async (order) => {
    if (chatId) {
      await bot.sendMessage(chatId, buildOrderMessage(order));
      if (orders.indexOf(order) === orders.length - 1) {
        await bot.sendMessage(
          chatId,
          `Больше заказов на ${tomorrow ? "завтра" : "сегодня"} нет`
        );
      }
    } else {
      const oldOrders = getOrders();
      if (oldOrders.some((number) => order.number == number)) return;
      addOrder(order.number);
      await sendMessageForAll(bot, buildOrderMessage(order, true));
    }
  });
};

const processOrders = async (bot, tomorrow = false, chatId) => {
  const html = await getHtmlPage(getUrl(tomorrow));
  const orders = await parseOrders(bot, html);

  if (!orders?.length) {
    await bot.sendMessage(
      ADMIN_CHAT_ID,
      "Не распарсились заказы, код страницы:" + "\n\t" + "```" + html + "```"
    );
    return;
  }

  await sendOrders(bot, orders, chatId, tomorrow);
};

export { processOrders, sleep };
