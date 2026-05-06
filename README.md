# Свадебное приглашение

Mobile-first digital wedding invitation для Насти и Паши.

## Что внутри

- Статический HTML/CSS/JavaScript без сборки и React.
- Акварельный botanical background из локального оптимизированного asset.
- Hero screen с именами, датой, днем недели и CTA.
- Красивый свадебный таймлайн.
- Собственная RSVP-модалка без перехода на Google Form.
- Demo-mode для RSVP, пока Google Apps Script endpoint не подключен.
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

Инструкция для Google Sheets лежит в [RSVP_SETUP.md](./RSVP_SETUP.md).
