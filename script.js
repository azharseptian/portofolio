
/* ----------------------------------------------------------------
   UTILITAS — Jalankan setelah DOM siap
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* 
     1. DARK / LIGHT MODE TOGGLE
        Menyimpan preferensi pengguna di localStorage
  */
  const themeToggle  = document.getElementById('themeToggle');
  const moonIcon     = document.getElementById('moonIcon');
  const sunIcon      = document.getElementById('sunIcon');
  const htmlEl       = document.documentElement;

  /**
   * Terapkan tema dan perbarui ikon toggle
   * @param {string} theme - 'dark' atau 'light'
   */
  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    if (theme === 'light') {
      moonIcon.style.display = 'none';
      sunIcon.style.display  = 'block';
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display  = 'none';
    }
  }

  // Muat preferensi tema yang tersimpan (atau pakai dark sebagai default)
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  // Klik toggle → ganti tema
  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  /* 2. NAVBAR — Efek bayangan saat scroll & active link */
  const navbar   = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function onScroll() {
    // Tambahkan class 'scrolled' jika sudah melewati 50px
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Tandai menu aktif berdasarkan posisi scroll
    let currentSection = '';
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Jika sudah di paling bawah halaman, paksa aktifkan section terakhir
    if (scrollY + windowHeight >= docHeight - 10) {
  currentSection = sections[sections.length - 1].getAttribute('id');
    } else {
    sections.forEach(section => {
    // Offset lebih besar agar perpindahan aktif lebih cepat terdeteksi
    const sectionTop = section.offsetTop - 200;
    if (scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
        }
      });
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* 3. HAMBURGER MENU (Mobile) */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  // Buka / tutup menu mobile
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  // Tutup menu saat link diklik
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  // Tutup menu jika klik di luar area nav
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('open');
    }
  });


  /* 
     4. TYPED TEXT EFFECT — Hero section
        Rotasi teks seperti mesin ketik
  */
  const typedEl = document.getElementById('typedText');

  // Ganti atau tambah teks di sini sesuai peran / keahlian Anda
  const typedWords = [
    'Web Developer 💻',
    'UI/UX Enthusiast 🎨',
    'Data Analyst 🎓 ',
    'Problem Solver 🔧',
  ];

  let wordIndex    = 0;
  let charIndex    = 0;
  let isDeleting   = false;
  const typeSpeed  = 90;   // ms per karakter saat mengetik
  const deleteSpeed = 50;  // ms per karakter saat menghapus
  const pauseEnd   = 1800; // ms berhenti di akhir kata
  const pauseStart = 400;  // ms berhenti sebelum mulai kata baru

  function typeEffect() {
    if (!typedEl) return;

    const currentWord = typedWords[wordIndex];

    if (isDeleting) {
      // Hapus satu karakter
      typedEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Tambah satu karakter
      typedEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentWord.length) {
      // Selesai mengetik → pause lalu mulai hapus
      delay = pauseEnd;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Selesai menghapus → pindah ke kata berikutnya
      isDeleting = false;
      wordIndex  = (wordIndex + 1) % typedWords.length;
      delay      = pauseStart;
    }

    setTimeout(typeEffect, delay);
  }

  typeEffect();


  /* 
     5. SCROLL-TRIGGERED ANIMATIONS (AOS ringan tanpa library)
        Menggunakan IntersectionObserver untuk performa optimal
  */
  const aosElements = document.querySelectorAll('[data-aos]');

  const observerOptions = {
    threshold: 0.12,       // muncul saat 12% elemen terlihat
    rootMargin: '0px 0px -50px 0px'
  };

  const aosObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;

        // Ambil delay dari atribut (misal data-aos-delay="200")
        const delay = el.getAttribute('data-aos-delay') || 0;

        setTimeout(() => {
          el.classList.add('aos-animate');
        }, parseInt(delay));

        // Hentikan observasi setelah animasi — agar tidak diulang
        aosObserver.unobserve(el);
      }
    });
  }, observerOptions);

  aosElements.forEach(el => aosObserver.observe(el));


  /* ==============================================================
     6. SKILL BAR ANIMATION
        Progress bar muncul animasi saat section Skills terlihat
     ============================================================== */
  const levelBars     = document.querySelectorAll('.level-bar');
  let skillsAnimated  = false;

  const skillsSection = document.getElementById('skills');

  const skillsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !skillsAnimated) {
      skillsAnimated = true;

      levelBars.forEach(bar => {
        const targetLevel = bar.getAttribute('data-level');
        // Animasi triggered via CSS transition — set width setelah render
        requestAnimationFrame(() => {
          bar.style.width = targetLevel + '%';
        });
      });
    }
  }, { threshold: 0.3 });

  if (skillsSection) skillsObserver.observe(skillsSection);


  /* ==============================================================
     7. FOOTER — Tampilkan tahun berjalan otomatis
     ============================================================== */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  /* ==============================================================
     8. SMOOTH SCROLL — Fallback untuk browser lama
        (Browser modern sudah mendukung via CSS scroll-behavior)
     ============================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    });
  });


}); // ← Akhir DOMContentLoaded
