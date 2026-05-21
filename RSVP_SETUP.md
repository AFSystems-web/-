# Подключение RSVP к Telegram

Форма на сайте отправляет ответы в `RSVP_ENDPOINT` из `app.js`.
Токен Telegram-бота нельзя хранить в коде сайта, поэтому нужен маленький прокси через Google Apps Script.

## Что будет приходить невесте

```text
Новый ответ RSVP

Имя: Анна Иванова
Количество гостей: 2
Кто будет с гостем: Иван
Комментарий: будем после 16:00
Время: 2026-05-21T10:45:00.000Z
```

## 1. Создать бота

1. В Telegram открой `@BotFather`.
2. Напиши `/newbot`.
3. Задай имя и username бота.
4. Сохрани `BOT_TOKEN`.

## 2. Узнать chat_id невесты

1. Невеста должна открыть созданного бота и нажать `Start`.
2. В браузере открой:

```text
https://api.telegram.org/botBOT_TOKEN/getUpdates
```

3. Найди в ответе `chat.id`. Это и есть `CHAT_ID`.

Если бот будет писать в общий чат, сначала добавь бота в чат, напиши туда любое сообщение и так же посмотри `chat.id`.

## 3. Создать Google Apps Script

1. Открой `https://script.google.com`.
2. Создай новый проект.
3. Вставь код из файла `telegram-rsvp.gs` или скопируй его отсюда:

```js
const BOT_TOKEN = 'PASTE_TELEGRAM_BOT_TOKEN_HERE';
const CHAT_ID = 'PASTE_TELEGRAM_CHAT_ID_HERE';

function doPost(e) {
  const data = e.parameter || {};

  const firstName = clean(data.firstName);
  const lastName = clean(data.lastName);
  const guestsCount = clean(data.guestsCount) || '1';
  const guestsNames = clean(data.guestsNames);
  const comment = clean(data.comment);
  const createdAt = clean(data.createdAt);

  const message = [
    'Новый ответ RSVP',
    '',
    `Имя: ${[firstName, lastName].filter(Boolean).join(' ') || 'Не указано'}`,
    `Количество гостей: ${guestsCount}`,
    guestsNames ? `Кто будет с гостем: ${guestsNames}` : '',
    comment ? `Комментарий: ${comment}` : '',
    createdAt ? `Время: ${createdAt}` : ''
  ].filter(Boolean).join('\n');

  UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  });

  return ContentService.createTextOutput('ok');
}

function clean(value) {
  return String(value || '').trim();
}
```

4. Замени `PASTE_TELEGRAM_BOT_TOKEN_HERE` и `PASTE_TELEGRAM_CHAT_ID_HERE`.

## 4. Опубликовать endpoint

1. Нажми `Deploy` -> `New deployment`.
2. Тип deployment: `Web app`.
3. `Execute as`: `Me`.
4. `Who has access`: `Anyone`.
5. Скопируй `Web App URL`.
6. Вставь его в `app.js`:

```js
const RSVP_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

После этого каждое подтверждение на сайте будет приходить в Telegram.
