import {
  existsSync,
  writeFileSync,
  appendFileSync,
  readFileSync,
  truncate,
} from "fs";

class JSONStorage {
  constructor(filename) {
    this.filename = filename;

    if (!existsSync(filename)) {
      writeFileSync(filename, "");
    }
  }

  appendData(data, successMessage) {
    try {
      appendFileSync(this.filename, `${data};`);
      console.log(successMessage ?? `Данные успешно записаны.`);
    } catch (error) {
      console.error("Ошибка при записи в файл:", error);
    }
  }

  load() {
    try {
      return readFileSync(this.filename, "utf8").split(";");
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("Файл не существует.");
        return null;
      }
      throw error;
    }
  }

  clear() {
    try {
      truncate(this.filename);
      console.log(`Файл успешно очищен.`);
    } catch (error) {
      console.error("Ошибка при очистке файла:", error);
    }
  }
}

const users = new JSONStorage("./modules/storage/users.json");
const orders = new JSONStorage("./modules/storage/orders.json");

const getUsers = (id) => users.load();

const checkUserId = (id) => users.load().some((userId) => userId == id);

const addUser = (id) => users.appendData(id);

const getOrders = () => orders.load();

const addOrder = (number) =>
  orders.appendData(number, `Считан новый заказ ${number}`);

const clearOrders = () => orders.clear();

export { getUsers, checkUserId, addUser, getOrders, addOrder, clearOrders };
