import TelegramBot from "node-telegram-bot-api";
import { checkUserId, addUser } from "./modules/storage/index.js";
import { processOrders, sleep } from "./modules/scraper.js";

const API_KEY_BOT = "7054543617:AAEGkIFq6mR2691o1m4Zi3eAMzPxYTHtAOQ";
const BOT_SECRET = "8d43b17d-0e0d-406f-b10c-9bdb473944d2";
const INTERVAL_TIME = 6000;

const COMMANDS = [
  { command: "today", description: "Показать сегодняшние ордера" },
  { command: "tomorrow", description: "Показать завтрашние ордера" },
  { command: "status", description: "Проверка статуса" },
];

const bot = new TelegramBot(API_KEY_BOT, {
  polling: true,
});

const sendUnauthorizedMessage = (userId) =>
  bot.sendMessage(userId, "Введите токен доступа выданный вам разработчиком");

const sendTodayOrders = async (userId) => {
  if (checkUserId(userId)) {
    processOrders(bot, false, userId);
  } else {
    sendUnauthorizedMessage(userId);
  }
};

const sendTomorrowOrders = async (userId) => {
  if (checkUserId(userId)) {
    processOrders(bot, true, userId);
  } else {
    sendUnauthorizedMessage(userId);
  }
};

bot.setMyCommands(COMMANDS);

bot.on("text", async (msg) => {
  const userId = msg.chat.id;

  try {
    switch (msg.text) {
      case "/start":
        sendUnauthorizedMessage(userId);
        break;
      case BOT_SECRET:
        addUser(userId);
        await bot.sendMessage(userId, "Вы успешно авторизовались");
        break;
      case "/today":
        await sendTodayOrders(userId);
        break;
      case "/tomorrow":
        await sendTomorrowOrders(userId);
        break;
      case "/status":
        await bot.sendMessage(userId, "Я жив, у меня все прекрасно");
        break;
    }
  } catch (error) {
    console.log(error);
  }
});

bot.on("polling_error", (err) => console.log(err.data.error.message));

while (true) {
  if (new Date().getHours() + 3 <= 18) {
    processOrders(bot);
    await sleep(INTERVAL_TIME);
  } else {
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot);
    await sleep(INTERVAL_TIME);
    processOrders(bot, true);
    await sleep(INTERVAL_TIME);
  }
}
