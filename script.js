// ==========================================
// UA LEGION — ОСНОВНИЙ SCRIPT
// ==========================================


// ==========================================
// МОБІЛЬНЕ МЕНЮ
// ==========================================

const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');

if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

document.querySelectorAll('.nav a').forEach((a) => {
  a.addEventListener('click', () => {
    if (nav) {
      nav.classList.remove('open');
    }
  });
});


// ==========================================
// REVEAL ANIMATION
// ==========================================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.08
  }
);

document
  .querySelectorAll(
    '.section, .game-card, .event, .mini-card, .truck'
  )
  .forEach((el) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition =
      'opacity .7s ease, transform .7s ease';

    observer.observe(el);
  });


// Додаємо клас для анімації
const style = document.createElement('style');

style.textContent = `
  .visible {
    opacity: 1 !important;
    transform: none !important;
  }
`;

document.head.appendChild(style);


// ==========================================
// UA LEGION — ФОРМА ЗАЯВКИ
// ==========================================

// Твоя Supabase Edge Function
const SUPABASE_FUNCTION_URL =
  'https://trjneluohyxcumnyfufd.supabase.co/functions/v1/bright-api';


// Знаходимо форму
const applicationForm =
  document.getElementById('applicationForm');


if (applicationForm) {

  applicationForm.addEventListener(
    'submit',
    async (event) => {

      // Не даємо браузеру перезавантажувати сторінку
      event.preventDefault();


      // Знаходимо кнопку
      const submitButton =
        applicationForm.querySelector(
          'button[type="submit"]'
        );


      // Запам'ятовуємо текст кнопки
      const originalButtonText =
        submitButton
          ? submitButton.textContent
          : 'НАДІСЛАТИ ЗАЯВКУ';


      // Блокуємо кнопку на час відправки
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'НАДСИЛАЄМО...';
      }


      try {

        // ======================================
        // ЗБИРАЄМО ДАНІ ФОРМИ
        // ======================================

        const formData =
          new FormData(applicationForm);


        const application = {

          name:
            String(formData.get('name') || '').trim(),

          age:
            String(formData.get('age') || '').trim(),

          discord_nick:
            String(
              formData.get('discord_nick') || ''
            ).trim() || null,

          discord_id:
            String(
              formData.get('discord_id') || ''
            ).trim() || null,

          truckersmp_nick:
            String(
              formData.get('truckersmp_nick') || ''
            ).trim() || null,

          truckersmp_id:
            String(
              formData.get('truckersmp_id') || ''
            ).trim() || null,

          steam_id:
            String(
              formData.get('steam_id') || ''
            ).trim() || null,

          game_nick:
            String(
              formData.get('game_nick') || ''
            ).trim() || null,

          direction:
            String(
              formData.get('direction') || ''
            ).trim(),

          about:
            String(
              formData.get('about') || ''
            ).trim() || null,

          source:
            String(
              formData.get('source') || ''
            ).trim() || null
        };


        // ======================================
        // ПЕРЕВІРКА ОБОВ'ЯЗКОВИХ ПОЛІВ
        // ======================================

        if (
          !application.name ||
          !application.age ||
          !application.direction
        ) {

          alert(
            'Будь ласка, заповніть усі обов’язкові поля.'
          );

          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent =
              originalButtonText;
          }

          return;
        }


        // ======================================
        // ВІДПРАВКА В SUPABASE
        // ======================================

        const response = await fetch(
          SUPABASE_FUNCTION_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body:
              JSON.stringify(application)
          }
        );


        // Отримуємо відповідь
        const result =
          await response.json();


        // ======================================
        // ПЕРЕВІРКА ВІДПОВІДІ
        // ======================================

        if (
          !response.ok ||
          !result.success
        ) {

          throw new Error(
            result.error ||
            'Не вдалося відправити заявку'
          );
        }


        // ======================================
        // УСПІШНА ВІДПРАВКА
        // ======================================

        applicationForm.innerHTML = `

          <div
            style="
              text-align:center;
              padding:60px 20px;
            "
          >

            <div
              style="
                font-size:64px;
                margin-bottom:20px;
              "
            >
              🇺🇦
            </div>


            <h2
              style="
                color:#fff;
                margin-bottom:15px;
              "
            >
              Заявку успішно надіслано!
            </h2>


            <p
              style="
                color:#9aa4b2;
                line-height:1.7;
                max-width:600px;
                margin:0 auto 30px;
              "
            >
              Дякуємо за заявку до UA LEGION.
              Ми переглянемо її та зв'яжемося
              з вами через Discord.
            </p>


            <a
              href="index.html"
              style="
                display:inline-block;
                padding:14px 28px;
                background:#2878ff;
                color:#fff;
                text-decoration:none;
                font-weight:800;
                border-radius:4px;
              "
            >
              ПОВЕРНУТИСЯ НА ГОЛОВНУ
            </a>

          </div>

        `;


      } catch (error) {

        // ======================================
        // ПОМИЛКА
        // ======================================

        console.error(
          'UA LEGION — помилка відправки заявки:',
          error
        );


        alert(
          'Не вдалося відправити заявку.\n\n' +
          'Спробуйте ще раз.'
        );


        // Повертаємо кнопку
        if (submitButton) {

          submitButton.disabled = false;

          submitButton.textContent =
            originalButtonText;
        }

      }

    }
  );

}
