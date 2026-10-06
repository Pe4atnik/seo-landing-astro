# SEO Landing для Astro

[English version](README.md)

Astro-ориентированный, совместимый с upstream форк [`aleksandr-alhoff/seo-landing`](https://github.com/aleksandr-alhoff/seo-landing). Навык задаёт безопасный процесс аудита, создания и улучшения SEO-лендингов и многостраничных Astro-сайтов.

Форк сохраняет полезные общие рекомендации upstream для статического HTML и добавляет проверку исходников и результата сборки, маршрутов, layouts/components, изображений Astro, islands, доступности и репрезентативную проверку семейств страниц.

## Главное

- Существующий проект по умолчанию проверяется в режиме **только чтение**, пока пользователь явно не попросит изменения.
- Astro-проект остаётся Astro: навык не заменяет его архитектуру корневыми `index.html`, CSS и JS.
- Аудит разделяет исходный владелец проблемы и итоговый HTML/deploy.
- Автоматическое покрытие маршрутов не выдаётся за человеческую визуальную и редакционную приёмку.
- Проверяются metadata, canonical, sitemap, JSON-LD, изображения, islands, формы, accessibility и производительность с учётом Astro.
- Lighthouse lab, полевые CWV, техническая готовность и позиции в поиске — разные виды доказательств.
- Опциональный офлайн-аудитор работает на встроенных модулях Node.js, без установки пакетов и сети.

## Режимы

| Режим | Когда | Запись в проект |
| --- | --- | --- |
| `audit-only` | проверить существующий сайт | Нет |
| `fix-existing` | явно запрошены точечные изменения | Да, в согласованных границах |
| `generate` | явно запрошен новый сайт/лендинг | Да |

Навык не устанавливает зависимости, не отправляет приватные страницы внешним валидаторам, не меняет production/серверную конфигурацию и не включает внешние сервисы без явного разрешения.

## Состав

```text
SKILL.md                       основной Agent Skill
references/astro-workflow.md  Astro-чеклист
references/tech-spec.md       общая/static-HTML спецификация upstream
references/map-facade.md      отложенная карта
references/video-facade.md    отложенное видео
references/server-config.md   только примеры для ревью
scripts/audit-astro.mjs       офлайн-проверка исходников/dist
tests/                        тесты Node и компактные fixtures
benchmark/                    исторические материалы upstream
UPSTREAM.md                   безопасная синхронизация
```

## Установка

Клонируйте репозиторий в каталог skills вашего агента. Имя каталога `seo-landing-astro` соответствует имени навыка.

```bash
git clone https://github.com/Pe4atnik/seo-landing-astro.git ~/.agents/skills/seo-landing-astro
```

Другие типичные назначения:

```text
~/.claude/skills/seo-landing-astro
~/.cursor/skills/seo-landing-astro
~/.copilot/skills/seo-landing-astro
~/.gemini/skills/seo-landing-astro
~/.openclaw/skills/seo-landing-astro
<project>/.agents/skills/seo-landing-astro
```

Учитывайте правила доверия и перезагрузки конкретного клиента. Репозиторий сам себя не устанавливает и существующий навык не перезаписывает.

## Применение

```text
Проведи read-only аудит Astro-проекта. Проверь исходники и dist, составь полный
реестр маршрутов и отдельно укажи desktop/mobile покрытие и заблокированные проверки.
```

```text
Исправь подтверждённые ошибки canonical и JSON-LD. Сохрани маршруты и дизайн,
запусти существующие регрессионные тесты и опиши откат.
```

## Офлайн-помощник

```bash
node scripts/audit-astro.mjs /path/to/astro-project
```

Он ищет только детерминированные признаки: отсутствие/относительный canonical, сломанный JSON-LD в итоговом HTML, проблемы title/description/H1, eager islands и изображения без явных размеров. Он не заменяет сборку Astro, браузер, accessibility-инструменты, Lighthouse, проверку смысла schema и человеческую приёмку. В проверяемый проект ничего не пишет.

## Тесты

Нужен Node.js 18+, установка пакетов не нужна.

```bash
node --test tests/*.mjs
node scripts/audit-astro.mjs tests/fixtures/astro-basic
```

## Синхронизация с upstream

Remote `upstream` должен указывать на `https://github.com/aleksandr-alhoff/seo-landing.git`. Оба проекта намеренно меняют `SKILL.md` и README, поэтому нужна ревью-синхронизация, а не разрушительное зеркалирование. Пошаговый процесс: [UPSTREAM.md](UPSTREAM.md).

Материалы `benchmark/` сохранены как источник происхождения. Их значения — один исторический lab-тест, не гарантия результата и не полевые Core Web Vitals.

## Ограничения

- Статический анализ не доказывает runtime-поведение, визуальное качество, eligibility schema или полевые CWV.
- SSR/dynamic routes могут требовать запущенный deploy или проектные интеграционные тесты.
- Офлайн-помощник использует консервативные regex-проверки; итог компонента нужно проверять в output.
- Выборка по семействам маршрутов не равна индивидуальной человеческой проверке каждой страницы.
- Серверные примеры upstream нельзя применять к конкретному серверу без ревью.

## Лицензия

Сохранены MIT-лицензия и атрибуция upstream: [LICENSE](LICENSE). Безопасность: [SECURITY.md](SECURITY.md).
