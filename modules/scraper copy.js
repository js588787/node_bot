import puppeteer from "puppeteer";

//12870856
//Popopo26
const SESSION_TOKEN = "fhpdjek5ij83oso8gcj802ria3";

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

const getContent = async (url) => {
  console.log("Запрашиваемый URL:", url);

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--ignore-certificate-errors",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-extensions",
      "--proxy-server='direct://'",
      "--proxy-bypass-list=*",
    ],
  });

  const page = await browser.newPage();

  // Установка заголовков
  await page.setExtraHTTPHeaders({
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate",
    "accept-language": "ru-RU,ru;q=0.9",
    "cache-control": "max-age=0",
    connection: "keep-alive",
    host: "business.netboosters.ru",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });

  // Установка cookie
  await page.setCookie(
    {
      name: "PHPSESSID",
      value: SESSION_TOKEN,
      domain: ".business.netboosters.ru",
    },
    {
      name: "_ym_uid",
      value: "1737027183158660615",
      domain: ".business.netboosters.ru",
    },
    {
      name: "_ym_d",
      value: "1737027183",
      domain: ".business.netboosters.ru",
    },
    {
      name: "_ym_isad",
      value: "2",
      domain: ".business.netboosters.ru",
    },
    {
      name: "_ym_visorc",
      value: "w",
      domain: ".business.netboosters.ru",
    }
  );

  // Эмуляция устройства
  await page.emulate({
    viewport: {
      width: 1280,
      height: 800,
    },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  });

  // Эмуляция ввода пользователя
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", {
      get: () => false,
    });
  });

  try {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
  } catch (error) {
    console.error("Ошибка навигации:", error.message);
    await browser.close();
    return;
  }

  const content = await page.content();

  await browser.close();

  console.log(content);
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

const processOrders = async (tomorrow = false) => {
  await getContent(getUrl(tomorrow));
};

export { processOrders };
