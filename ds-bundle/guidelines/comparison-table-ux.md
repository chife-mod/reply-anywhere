# Comparison table — researched UX rules (for the upcoming section)

Context: the site will get a comparison section **Sprinklr vs Gominga vs ReplyAnywhere** —
3 columns; boolean rows (check / cross), quantitative rows (numbers), and a price row
rendered as dollar signs ($$ / $$$ / $$$$$). ReplyAnywhere's own column gets the violet
highlight. The digest below was compiled from Baymard / NN/g / Smashing and verified
against 23 live production references (2026-07-08).

# UX-дайджест: сравнительные таблицы (competitor comparison / feature matrix)

## Практики

1. **3 колонки — идеал, максимум 5.** Сравнительная таблица работает только при малом числе альтернатив («compensatory decision making»); больше 5 — уже нужен фильтр, а не таблица. Наш кейс (3 колонки) — в зоне лучшей читаемости. — [NN/g, Comparison Tables](https://www.nngroup.com/articles/comparison-tables/)

2. **Подсветка своей колонки — фоном/бордером/акцентом, а не только цветом галочек.** Выделенная hero-колонка направляет взгляд и снимает вопрос «за кого таблица»; NN/g отмечает приём цветового кодирования колонок (FitBit — разные цвета галочек на колонку). Для ReplyAnywhere: violet-заливка/обводка колонки + CTA прямо в шапке колонки. — [NN/g](https://www.nngroup.com/articles/comparison-tables/); живой пример: [Intercom vs Zendesk](https://www.intercom.com/intercom-vs-zendesk)

3. **Булевы значения = иконка-форма, не цвет.** Галочка и крестик должны различаться формой (✓/✕), а не только зелёным/красным (WCAG 1.4.1 «Use of Color»); каждой иконке — `aria-label`/`<span class="sr-only">Да/Нет</span>`, таблице — настоящий `<table>` с `th scope="col/row"` и `caption`. На тёмной теме следить за контрастом крестика (не «утапливать» его до нечитаемости). — [Smashing, Accessible Responsive Tables Pt.1](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part1/), [Pt.2](https://www.smashingmagazine.com/2022/12/accessible-front-end-patterns-responsive-tables-part2/)

4. **Не всё сводить к галочкам — квалифицированные значения сильнее.** «✓» скрывает разницу в качестве; там где можно — число, лимит или пометка «Limited / Add-on / Enterprise / Beta». Это и честнее, и информативнее голого креста у конкурента. — [Smashing, Designing the Perfect Feature Comparison Table](https://www.smashingmagazine.com/2017/08/designing-perfect-feature-comparison-table/); эталон: [PostHog Feature Matrix](https://posthog.com/feature-matrix)

5. **Группировать строки под подзаголовками, «core»-функции — первыми.** В SaaS-исследовании Baymard матрицы содержали в среднем ~40 строк; группировка даёт контекст незнакомым фичам, а порядок групп по важности резко улучшает сканирование. Для нас: группы вроде «Каналы», «AI-ответы», «Аналитика», «Цена». — [Baymard, 5 Ways to Improve Plan Matrix Scannability](https://baymard.com/blog/saas-scannability-plan-matrix)

6. **Sticky-шапка колонок (лого + имя + цена) при скролле.** Прямая жалоба юзера из тестов Baymard: «wish the top section floated so you could still see what the price difference was». С длинной таблицей без sticky-шапки пользователь теряет, чья это колонка. — [Baymard](https://baymard.com/blog/saas-scannability-plan-matrix); эталон реализации: [Apple iPhone Compare](https://www.apple.com/iphone/compare/)

7. **Горизонтальная делинеация строк — линии или зебра.** Без разделителей глаз «соскальзывает» со строки при трассировке через 3 колонки; на тёмной теме — тонкие бордеры/чуть более светлые полосы вместо жирной зебры. — [Baymard](https://baymard.com/blog/saas-scannability-plan-matrix), [NN/g](https://www.nngroup.com/articles/comparison-tables/)

8. **Текст в ячейках — телеграфный, без предложений.** «Keep it short. Avoid full sentences» — длинный текст убивает сканируемость; пояснения уносить в tooltip/инфо-иконку у названия строки (progressive disclosure). — [NN/g](https://www.nngroup.com/articles/comparison-tables/)

9. **Цена значками $$/$$$ — сканируется мгновенно, но требует якоря.** Символьная шкала хороша как относительный сигнал, однако NN/g требует «explicitly state the difference»: неоднозначные метки без конкретики подрывают доверие. Дать легенду/tooltip с реальными диапазонами (например «$$$ = от $X/мес») или сноску «по данным опубликованных прайсов, дата». — [NN/g, Explicitly State the Difference Between Options](https://www.nngroup.com/articles/explicit-differences/)

10. **Мобайл: 3 колонки не сжимать — переключать.** Паттерны: (а) column-picker/дропдауны над таблицей — показываем 2 колонки из 3, как у Apple; (б) табы-колонки (NN/g); (в) при горизонтальном скролле — залоченная первая колонка с названиями строк. Для «наша vs конкурент» удобен вариант «ReplyAnywhere закреплён + дропдаун выбора конкурента». — [NN/g, Mobile Tables](https://www.nngroup.com/articles/mobile-tables/); живой пример: [Apple Compare](https://www.apple.com/iphone/compare/)

11. **Честность = конверсия доверия: у конкурентов должны быть свои галочки.** Стена крестиков у Sprinklr/Gominga читается как манипуляция и обнуляет таблицу; отдавайте конкурентам реальные победы (у PostHog Mixpanel получает «Metric trees», у Postmark SendGrid — A/B-тесты и валидацию email). PostHog даже закрепил это политикой в хендбуке. — [PostHog Handbook, Product Comparisons](https://posthog.com/handbook/engineering/posthog-com/product-comparisons); [Postmark vs SendGrid](https://postmarkapp.com/compare/sendgrid)

12. **Контент важнее дизайна: полнота и консистентность строк.** Главный провал сравнительных таблиц по NN/g — не вёрстка, а дырявые/несопоставимые данные: каждая строка должна быть заполнена для всех трёх колонок (нет данных → «н/д» с пояснением, а не пустота и не крестик). — [NN/g](https://www.nngroup.com/articles/comparison-tables/)

## Живые продакшн-страницы (проверены, прямые URL)

- **https://www.apple.com/iphone/compare/** — эталон мобильного паттерна: дропдауны-селекторы колонок, sticky-шапка с ценой, группировка спеков.
- **https://posthog.com/feature-matrix** — большая честная матрица: ✓/✕ + нюансы «Add-on/Beta/Limited», группировка по продуктам, навигация по секциям; сайт с тёмной темой.
- **https://posthog.com/blog/posthog-vs-mixpanel** — формат «X vs Y» с таблицами, где конкурент получает реальные галочки.
- **https://postmarkapp.com/compare/sendgrid** — классика честного сравнения: SendGrid выигрывает несколько строк, фокус на 2-3 killer-отличиях (поддержка, retention 45 vs 3 дня).
- **https://plausible.io/vs-google-analytics** — таблица ключевых отличий + текстовое признание сильных сторон GA4.
- **https://supabase.com/alternatives/supabase-vs-firebase** — секционные таблицы по темам (auth, storage, pricing) вместо одной простыни; бренд с тёмной эстетикой.
- **https://www.intercom.com/intercom-vs-zendesk** — двухколоночная матрица с визуально выделенной своей колонкой.
- **https://clickup.com/compare/monday-vs-clickup** — типовой SaaS «vs»-лендинг с фиче-таблицей и ценовым блоком (сайт отдаёт 403 ботам; URL подтверждён поиском).

## Приложение к нашему кейсу (3 колонки, тёмная тема, violet)

- Колонка ReplyAnywhere — справа или в центре с violet-обводкой/заливкой ~8-12% и CTA в шапке; sticky-шапка всех трёх колонок с лого + $-шкалой.
- Галочки: violet «✓» у нас, нейтрально-серые «✓» у конкурентов (не красить чужие галочки в «плохой» цвет), «✕» — форма + приглушённый тон + aria-label.
- Количественные строки (число каналов, языки, SLA) размещать выше булевых — они убедительнее галочек.
- Строку цены `$$ / $$$ / $$$$$` снабдить легендой-tooltip и сноской об источнике данных.
- Мобайл: закреплённая колонка ReplyAnywhere + переключатель Sprinklr/Gominga.