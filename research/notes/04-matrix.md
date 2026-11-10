# 04 — Матриця конкурентів

> Основа: список з [03-competitors.md](./03-competitors.md). Нового пошуку не робили.
> Зібрано **2026-11-10**: Playwright (Chrome, вікно 1440×900, локаль браузера `uk-UA`, як у нашого UA-відвідувача), публічні сторінки, web fetch.
> Кабінети за логіном не відкривали. Форми не надсилали. На банерах cookie обирали відмову від необов'язкових (у Admitad банер лишився на скріні, згоду не надавали).
> Скріни власного акаунта: теки `research/screens/own/` немає, тому цей пункт пропущено.

## Кого взяли і чому

| # | Компанія | Група | Чому саме вона |
|---|---|---|---|
| 1 | **Dr.Cash** | ХАРД | Найближчий конкурент за вертикаллю (nutra/COD) і нашими GEO (PL, RO, HU, CZ, SK є у фільтрі каталогу). Єдиний, хто показує офери зі ставками без логіну. |
| 2 | **LeadRock** | ХАРД | Найближчий до нашої цільової дії: менеджери з Telegram-хендлами і форма заявки прямо на лендінгу. Темний неоновий стиль, як у нашому напрямку дизайну. |
| 3 | **Alfaleads** | СОФТ | Інша вертикаль (iGaming), та сама задача. Найчіткіший поділ «аффіліати / рекламодавці», окремі форми для кожного й Team check проти шахраїв у Telegram. |
| 4 | **Admitad** | СОФТ | Покриває нашу другу вертикаль, E-com. Має форму заявки для рекламодавця і окремий шлях для паблішера, частково локалізований під UA. |
| 5 | **Awin** | АСПІРАЦІЙНИЙ | Еталон того, як розвести аудиторії («Tell us who you are» → 4 доріжки) і як побудувати контактну форму. |

---

## Позначення джерел

- `[S: файл]` — скрін у [`research/screens/`](../screens/), знятий Playwright.
- `[W: URL]` — публічна сторінка (web fetch або текст DOM, витягнутий Playwright).
- `[R: …]` — відгуки, магазини застосунків, сторонні джерела.
- **«доступ обмежений»** — екран існує, але без логіну його не видно.

---

## Матриця

Осі під наш продукт:
- **Вісь 1 — Перший екран:** що бачить відвідувач без прокрутки.
- **Вісь 2 — «Написати компанії про співпрацю»:** ключова задача з брифу (Telegram або форма заявки). Як вона проходить.
- **Вісь 3 — «Топові офери з високим ROI і максимальним конвертом»:** головне для аудиторії, формулювання з брифу. Чи видно це одразу.
- **Вісь 4 — Як задача завершується:** що відбувається в кінці шляху.
- **Вісь 5 — Мова інтерфейсу:** що отримує відвідувач з українською локаллю.

| Вісь | Dr.Cash (ХАРД) | LeadRock (ХАРД) | Alfaleads (СОФТ) | Admitad (СОФТ) | Awin (АСПІР.) |
|---|---|---|---|---|---|
| **1. Перший екран** | Заголовок «Nutra. Worldwide.», одне речення-пояснення, кнопки «Join us 1min» і «Research offer». Праворуч мокап дашборду з рейтингом оферів, апрувом і ставками. Меню вже розділяє Affiliates / Advertisers. [S: [drcash-01](../screens/drcash-01-first-screen.png)] | Чорний фон, неон, мармурова статуя з ноутбуком. Заголовок «Nutra CPA affiliate network LeadRock», підзаголовок «Your benefit is a priority», одна кнопка «Become a partner». Цифр і оферів немає. [S: [leadrock-01](../screens/leadrock-01-first-screen.png)] | Брутальна велика типографіка «МЕЖДУНАРОДНАЯ ПАРТНЕРСКАЯ СЕТЬ В iGAMING» на рожевому 3D-фоні. Дві кнопки-ролі «Аффилиаты / Рекламодатели», «Регистрация» в шапці, соцмережі. Банер cookie. [S: [alfaleads-01](../screens/alfaleads-01-first-screen.png)] | Промо-банер Black Friday. Заголовок «Grow revenue through partnerships – for brands and publishers», логотипи брендів (Nike, Samsung, Revolut…). Дві кнопки «Start as Advertiser / Start as Publisher», рядок цифр «2000+ advertisers · 300,000+ publishers · 50+ countries». Банер cookie займає ліву третину. [S: [admitad-01](../screens/admitad-01-first-screen.png)] | Смуга вибору регіону, фото людини. Заголовок «Your growth, your way.», цифри «30K+ brands, 1M+ partners». У хіро немає кнопки, «Get started» лише в шапці. Нижче починається блок «Tell us who you are». [S: [awin-01](../screens/awin-01-first-screen.png)] |
| **2. «Написати компанії про співпрацю»** | Окремої кнопки «написати» на першому екрані немає. Контакт «Have questions? Ask» (іконки Telegram / email / Skype) лежить у блоці Affiliates нижче першого екрана. Для веба і для рекламодавця різні Telegram (`affhead_drcash` / `bizdev_dr_cash`). Головна кнопка веде на реєстрацію. [S: [drcash-02](../screens/drcash-02-contacts.png)] [W: dr.cash, посилання t.me у DOM] | Три шляхи: (1) «Become a partner» → сторінка логіну `/authorize/login`; (2) блок «Our Team», де можна написати будь-якому з 4 менеджерів за Telegram-хендлом; (3) форма «We're in touch» внизу сторінки з полями «email / Telegram / WhatsApp» і «message». [S: [leadrock-02](../screens/leadrock-02-team.png), [leadrock-05](../screens/leadrock-05-contact-form.png)] [W: leadrock.com, CTA → `/authorize/login`] | «Регистрация» відкриває вибір ролі, кожна роль веде на свою форму. Аффіліат: ім'я, прізвище, email, пароль, месенджер + нік. Рекламодавець: ім'я, прізвище, email, компанія, «які GEO плануєте», бренди й сайти. Пряма розмова лише через Telegram підтримки (`alfa_support24`) і email у футері. [S: [alfaleads-05](../screens/alfaleads-05-affiliate-form.png), [alfaleads-06](../screens/alfaleads-06-advertiser-form.png)] [W: alfaleads.net, кнопка «Регистрация» → `/ru/affiliates/form`, `/ru/advertisers/form`] | Розділено одразу в хіро. Рекламодавець → «Talk to Admitad Expert», форма (Name, Email, Website, Phone, Services, повідомлення → «Get my growth plan»). Паблішер → реєстрація (email + пароль) на login.mitgo.com. Telegram-контакту на шляху немає. [S: [admitad-02](../screens/admitad-02-advertiser-form.png), [admitad-03](../screens/admitad-03-publisher-signup.png)] | «Get started» веде на сторінку «Choose your path» з FAQ. «Contact» веде на форму «Say hello» (регіон, «хто ви», ім'я, email). Месенджерів немає. [S: [awin-02](../screens/awin-02-who-are-you.png), [awin-03](../screens/awin-03-getting-started.png), [awin-04](../screens/awin-04-contact.png)] |
| **3. «Топові офери з високим ROI і максимальним конвертом»: чи видно одразу** | **Так, найсильніше з п'яти.** На першому екрані мокап «Offers rating» з апрувом і ставками. Кнопка «Research offer» веде на **публічний каталог** (ID, офер, GEO в назві, Approve %, Payout $, Rank) з добірками «Highest AR%» і «Best in EU». [S: [drcash-01](../screens/drcash-01-first-screen.png), [drcash-04](../screens/drcash-04-offers.png)] [W: dr.cash/offers] | **Частково.** На першому екрані немає. Нижче є блок «Our offers for yours the maximum Appruval»: картки оферів з нішею і «Payout up to $25–34», але без GEO та апруву. Повний каталог: доступ обмежений (логін). [S: [leadrock-04](../screens/leadrock-04-offers-block.png)] [W: leadrock.com#offers] | **Ні.** Лише цифри «5000+ оферів», «1000+ прямих рекламодавців», «220% середнього росту топ-5 партнерів». Самих оферів і ставок не видно: доступ обмежений (my.alfaleads.net). [W: alfaleads.net/ru, текст DOM] | **Ні (не їхня модель).** Замість оферів логотипи брендів і цифри мережі. Офери та ставки: доступ обмежений (store.admitad.com). [S: [admitad-01](../screens/admitad-01-first-screen.png)] | **Ні (не їхня модель).** Замість оферів «30K+ brands» і кейси (Samsung ROI, Vodafone). Публічний каталог рекламодавців є, але без ставок. Застосунок «Awin for Publishers» (App Store / Google Play) працює лише після логіну: доступ обмежений. [S: [awin-01](../screens/awin-01-first-screen.png)] [W: awin.com] [R: [App Store](https://apps.apple.com/app/id6498894394), [Awin help](https://success.awin.com/articles/en_US/Knowledge/The-Awin-for-Publishers-app)] |
| **4. Як задача завершується** | Два фінали: (а) форма реєстрації (email, пароль, username, **месенджер + контакт**) → кабінет affiliate.dr.cash: доступ обмежений; (б) чат у Telegram з менеджером поза сайтом. У відгуках Trustpilot трапляються скарги, що менеджер не відповідає і що без нього не вивести гроші, тобто фінал «через менеджера» — точка ризику. [S: [drcash-03](../screens/drcash-03-signup.png)] [R: [Trustpilot dr.cash](https://uk.trustpilot.com/review/dr.cash)] | Три фінали: (а) реєстрація з 2 полів (email, пароль) → кабінет: доступ обмежений; (б) чат з менеджером у Telegram; (в) форма «Send» з приміткою, що натискання означає згоду з публічною офертою. Що показується після надсилання, не перевіряли (форму не надсилали). [S: [leadrock-03](../screens/leadrock-03-signup.png), [leadrock-05](../screens/leadrock-05-contact-form.png)] | Багатокрокова форма (кнопка «Далее») → кабінет my.alfaleads.net: доступ обмежений. Після контакту в Telegram можна перевірити співробітника через **Team check** на сайті (поле @username → «Проверить»). [S: [alfaleads-05](../screens/alfaleads-05-affiliate-form.png), [alfaleads-04](../screens/alfaleads-04-team-check.png)] | Рекламодавець надсилає форму і отримує обіцянку «we'll map out how to grow your sales», тобто відповідь експерта (екран після надсилання не перевіряли). Паблішер потрапляє в кабінет: доступ обмежений. [S: [admitad-02](../screens/admitad-02-advertiser-form.png), [admitad-03](../screens/admitad-03-publisher-signup.png)] | Контактна форма → відповідь команди (не надсилали). Реєстрація → ui.awin.com: доступ обмежений. FAQ на «Getting started» заздалегідь відповідає на «скільки часу до старту» і «чи безкоштовно». [S: [awin-03](../screens/awin-03-getting-started.png), [awin-04](../screens/awin-04-contact.png)] |
| **5. Мова інтерфейсу (локаль uk-UA)** | Лише EN, перемикача мов немає. [W: dr.cash, `lang="en"`] | EN: сайт сам переадресував на `/authorization/en/`. Перемикач EN ▾ з прапором. За кроком 03 основна мова RU. UA немає. [S: [leadrock-01](../screens/leadrock-01-first-screen.png)] [W: редирект leadrock.com → /authorization/en/] | **RU: автоматичний редирект на `/ru`** для української локалі. Перемикач мов — іконка-глобус. UA немає. [S: [alfaleads-01](../screens/alfaleads-01-first-screen.png)] [W: редирект alfaleads.net → /ru] | Сайт EN, але **банер cookie українською** («Добре», «Не передавати мої персональні дані»). Реєстрація паблішера проходить через `store.admitad.com/ua/…` і далі показує форму англійською. Регіональна UA-версія існує. [S: [admitad-01](../screens/admitad-01-first-screen.png), [admitad-03](../screens/admitad-03-publisher-signup.png)] [W: 03-competitors.md] | EN (`en-GB`). Вибір регіону («Global / Change Territory») замість мови, внутрішні сторінки переадресовуються на `/gb/`. UA немає. [S: [awin-01](../screens/awin-01-first-screen.png)] [W: awin.com/gb/getting-started] |

---

## Три спільні патерни ринку

1. **Спершу реєстрація, а розмова потім.** У чотирьох з п'яти головна кнопка першого екрана веде на реєстрацію або логін (Dr.Cash «Join us», LeadRock «Become a partner» → login, Alfaleads «Регистрация», Admitad «Start as Publisher»). Живий контакт (Telegram, менеджер, форма) лежить нижче першого екрана або у футері. [S: drcash-01, leadrock-01, alfaleads-01, admitad-01]
2. **Розділення аудиторій на окремі доріжки.** Dr.Cash, Alfaleads, Admitad і Awin одразу питають «хто ви» і ведуть кожну роль своїм шляхом, зі своєю формою чи контактом. Виняток — LeadRock, у якого один шлях для всіх. [S: drcash-02, alfaleads-01, admitad-01, awin-02]
3. **Масштаб у цифрах замість доказу результату.** Скрізь великі цифри мережі (7100+ оферів, 5000+ оферів, 300 000+ паблішерів, 30K+ брендів). Кейсів з ROI на головних сторінках хард- і софт-конкурентів майже немає: у Dr.Cash вони винесені в Telegram, у решти їх немає. [S: admitad-01, awin-01, alfaleads-01] [W: 03-competitors.md]

## Три відмінності

1. **Чи видно офери:** від публічного каталогу зі ставками й апрувом (Dr.Cash), через картки «Payout up to $X» без GEO (LeadRock), до повністю закритих оферів (Alfaleads, Admitad, Awin). [S: drcash-04, leadrock-04]
2. **Чим закінчується шлях:** кабінет (Dr.Cash, Alfaleads, паблішери Admitad), розмова з людиною в Telegram (LeadRock — 4 менеджери з хендлами, Dr.Cash — окремі TG для вебів і рекламодавців), або форма заявки з відповіддю експерта (Admitad для рекламодавців, Awin, форма LeadRock). Довіру до розмови в Telegram підсилює лише Alfaleads, через Team check. [S: leadrock-02, drcash-02, admitad-02, alfaleads-04]
3. **Мова для UA-відвідувача:** Alfaleads автоматично віддає RU, LeadRock — EN (основна RU), Dr.Cash і Awin — лише EN, Admitad — EN з UA-банером cookie. **Повноцінної української немає ні в кого.** Візуально ринок ділиться на темний неон і брутал (LeadRock, Alfaleads) та світлий корпоративний стиль (Admitad, Awin). Dr.Cash посередині: світлий фон з неоновими акцентами. [S: alfaleads-01, leadrock-01, admitad-01]

## Три відкриті питання до PM

1. **Чи показуємо офери і ставки на лендінгу?** Як Dr.Cash (каталог з апрувом і ставкою), як LeadRock («виплата до $X» без GEO), чи лише «ставки — у менеджера»? Від цього залежить, чи доведемо «топові офери з високим ROI і максимальним конвертом» на першому екрані. Питання пов'язане з відкритими питаннями 1–3 у CLAUDE.md (моделі оплати, виплати, цифри).
2. **Чим закінчується наша ключова задача і що людина бачить після неї?** Якщо кабінету немає і фінал — це Telegram або форма, то: (а) хто відповідає і за який час (це можна обіцяти на сайті, як «5 хв» у Keitaro); (б) що показуємо після надсилання форми; (в) чи потрібна реєстрація взагалі. Це питання про Telegram-бота пов'язане з відкритим питанням 17.
3. **Один шлях чи окремі доріжки для арбітражників і вебмайстрів та для рекламодавців?** Окремі доріжки — це окремі Telegram-контакти (як у Dr.Cash), окремі поля форми (як у Alfaleads: «які GEO» для рекламодавця) і, можливо, блок менеджерів з хендлами плюс перевірка «чи це справді наш менеджер» (як Team check). Хто з команди готовий бути публічним контактом?

---

### Обмеження

- Відгуки: Dr.Cash має багато відгуків на Trustpilot, і вони суперечливі. В Alfaleads лише 2 відгуки. Для LeadRock на Trustpilot не знайшли нічого. [R: [Trustpilot dr.cash](https://uk.trustpilot.com/review/dr.cash), [Trustpilot alfaleads](https://uk.trustpilot.com/review/alfaleads.net), [AffLift LeadRock](https://afflift.com/f/threads/leadrock-review.9533/latest)]
- Застосунки: є лише в Awin (за логіном). У Dr.Cash, LeadRock і Alfaleads застосунків не знайшли. В Admitad є тільки SDK для рекламодавців, публічного застосунку для паблішерів немає. [R: [Admitad SDK](https://edu.affiliate.admitad.com/en/sdk/amp/)]
- Демо-відео окремо не шукали. Висновки зроблено за сторінками і скрінами.
- Цифри наведено так, як їх заявляють самі компанії, ми їх не перевіряли.
