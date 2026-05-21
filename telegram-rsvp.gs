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
    createdAt ? `Время: ${createdAt}` : '',
  ].filter(Boolean).join('\n');

  UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
    }),
  });

  return ContentService.createTextOutput('ok');
}

function clean(value) {
  return String(value || '').trim();
}
