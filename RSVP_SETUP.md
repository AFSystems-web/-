# Подключение RSVP к Google Sheets

В `app.js` есть константа:

```js
const RSVP_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

Пока URL не указан, форма работает в demo-mode: показывает успешное сообщение и пишет предупреждение в консоль.

## Google Sheets

1. Создай Google Sheet.
2. Открой `Extensions` -> `Apps Script`.
3. Вставь скрипт:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.firstName || '',
    data.lastName || '',
    data.guestsCount || '',
    data.comment || '',
    data.createdAt || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Нажми `Deploy` -> `New deployment` -> `Web app`.
5. `Execute as`: `Me`.
6. `Who has access`: `Anyone`.
7. Скопируй `Web App URL`.
8. Вставь его в `RSVP_ENDPOINT`.

## Если появится CORS

Некоторые deployment-настройки Google Apps Script могут блокировать `fetch` с JSON.

Fallback-вариант:

1. Добавить в HTML скрытый iframe:

```html
<iframe name="rsvpHiddenFrame" hidden></iframe>
```

2. Вместо `fetch` отправлять обычную HTML form submission в этот iframe.
3. В Apps Script читать данные через `e.parameter`, а не `JSON.parse(e.postData.contents)`.

Для текущей первой версии оставлен основной JSON-вариант, потому что он чище и удобнее для дальнейшей интеграции.
