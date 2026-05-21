# Свадебное приглашение

Mobile-first digital wedding invitation для Насти и Паши.

## Что внутри

- Статический HTML/CSS/JavaScript без сборки и React.
- Акварельный botanical background из локального оптимизированного asset.
- Hero screen с именами, датой, днем недели и CTA.
- Красивый свадебный таймлайн.
- Собственная RSVP-модалка без перехода во внешние формы.
- Demo-mode для RSVP, пока Telegram endpoint через Google Apps Script не подключен.
- Поддержка `prefers-reduced-motion`.

## Запуск локально

```bash
python3 -m http.server 5173
```

Открой:

```text
http://localhost:5173
```

## Подключение RSVP

Инструкция для Telegram-уведомлений лежит в [RSVP_SETUP.md](./RSVP_SETUP.md).
