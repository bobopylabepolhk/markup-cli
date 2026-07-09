# markup-cli
Инструмент для вёрстки и тестирования шаблонов для zeta. Скачивает статику и создаёт файловую структуру.

## Установка

```bash
npm install
node bin/index.js [...]

можно установить глобально и использовать как `markup-cli`

npm install -g .
markup-cli [...] 
```

## Команды
### markup-cli [...]
Cоздаёт шаблон и скачивает страницы.

| Флаг                          | Описание                      | По умолчанию |
|-------------------------------|-------------------------------|--------------|
| -n, --name <name>             | Название страницы и шаблона   | -            |
| -p, --page <templateName=url> | Страница                      | -            |
| -o, --output <dir>            | Корневая папка страниц        | ./pages      |
| --no-download                 | Пропустить скачивание статики | false        |


Пример:
```bash
markup-cli -n search-results -p search-results="https://test.truckdrive.ru/offers/?search_searchstring=096.2536&search_searchtype=1&search_brandname=SAMPA&tab-search-line=search-by-articles" -o ./pages
```

### markup-cli reindex [pages-dir]
Регенерирует корневой index.html, обходя папку шаблонов и собирая все подпапки, у которых есть scraped/index.html.

### Файловая структура
При создании шаблона CLI разворачивает файловую структуру. Каждый шаблон ассоциируется со спаршенной страницей (1 шаблон:1 страница) и живет внутри единой корневой папки pages/.
Название шаблона уникально.

Внутри папки <templateName> 2 директории: 
/scraped - спаршенная страница, со всеми ассетами, пути к которым заменены на локальные и подключен jQuery.
/template - предсозданные <templateName>.html и <templateName>.css.

Ещё есть index.html с ссылками на index.html для страницы из /scraped.
