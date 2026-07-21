document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initNavigation();
    initCanvas();
    initContactForm();
    initSmoothScroll();
    initCursorGlow();
    loadData();
});

const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error(`No se pudo cargar data.json: ${response.status}`);
        const data = await response.json();
        renderPortfolio(data.portfolio || []);
        renderServices(data.services || []);
        renderReviews(data.reviews || []);
        lucide.createIcons();
        initAnimations();
    } catch (error) {
        console.error('Error cargando el contenido:', error);
        const grid = document.getElementById('portfolio-grid');
        if (grid) grid.innerHTML = `<div class="lg:col-span-2 p-8 border border-violet-500/20 bg-violet-500/5 rounded-2xl text-violet-100">No se pudo cargar el contenido. Abrí el proyecto con Live Server para que <strong>data.json</strong> funcione correctamente.</div>`;
    }
}

function renderPortfolio(items) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    grid.innerHTML = items.map((item, index) => {

        const title = escapeHTML(item.title);
        const category = escapeHTML(item.category);
        const description = escapeHTML(item.desc);
        const image = escapeHTML(item.img);
        const accent = escapeHTML(item.accent || "violet");

        const tags = (item.tags || [])
            .map(tag => `<span class="project-tag">${escapeHTML(tag)}</span>`)
            .join("");

        let action = `
            <span class="project-link text-white/45">
                Proyecto realizado
                <i data-lucide="check" class="w-4 h-4"></i>
            </span>
        `;

        let overlay = "";

        if (item.private) {

            action = `
                <a
                    href="${item.demoUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-link"
                >
                    Solicitar demo
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                </a>
            `;

        } else if (item.url) {

            action = `
                <a
                    href="${item.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-link"
                >
                    Ver proyecto
                    <i data-lucide="arrow-up-right" class="w-4 h-4"></i>
                </a>
            `;

            overlay = `
                <a
                    href="${item.url}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="project-overlay-link"
                ></a>
            `;
        }

        return `
            <article class="project-card reveal ${item.featured ? "large-card" : ""}" data-accent="${accent}">

                <img src="${image}" alt="${title}" loading="lazy">

                ${overlay}

                <div class="project-content">

                    <div class="project-topline">

                        <div class="flex flex-wrap items-center gap-2">

                            <span class="project-category">${category}</span>

                            ${
                                item.private
                                ? `
                                <span class="project-tag">
                                    🔒 Sistema privado
                                </span>
                                `
                                : ""
                            }

                        </div>

                        <span class="project-number">
                            ${String(index + 1).padStart(2, "0")}
                        </span>

                    </div>

                    <h3 class="project-title">${title}</h3>

                    <p class="project-description">
                        ${description}
                    </p>

                    <div class="project-footer">

                        <div class="project-tags">
                            ${tags}
                        </div>

                        ${action}

                    </div>

                </div>

            </article>
        `;

    }).join("");
}

function renderServices(items) {
    const grid = document.getElementById('services-grid');
    if (!grid) return;
    grid.innerHTML = items.map((service, index) => `
        <article class="service-card reveal">
            <span class="service-index">${String(index + 1).padStart(2, '0')}</span>
            <div class="service-icon"><i data-lucide="${escapeHTML(service.icon)}" class="w-5 h-5"></i></div>
            <h3 class="service-title">${escapeHTML(service.title)}</h3>
            <p class="service-description">${escapeHTML(service.desc)}</p>
        </article>`).join('');
}

function renderReviews(items) {
    const grid = document.getElementById('reviews-slider');
    if (!grid) return;
    grid.innerHTML = items.map(review => {
        const stars = Array.from({ length: Math.min(Number(review.stars) || 5, 5) }, () => '<i data-lucide="star" class="w-4 h-4 fill-current"></i>').join('');
        return `<article class="review-card reveal"><div class="review-stars">${stars}</div><p class="review-text">“${escapeHTML(review.text)}”</p><p class="review-user">— ${escapeHTML(review.user)}</p></article>`;
    }).join('');
}

function initCursorGlow() {
    const glow = document.querySelector('.cursor-glow');
    if (!glow || matchMedia('(pointer: coarse)').matches) return;
    window.addEventListener('pointermove', event => {
        glow.style.left = `${event.clientX}px`;
        glow.style.top = `${event.clientY}px`;
    }, { passive: true });
}

function initNavigation() {
    const navbar = document.getElementById('navbar');
    const button = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const updateNavbar = () => navbar?.classList.toggle('navbar-scrolled', window.scrollY > 20);
    const closeMenu = () => {
        if (!button || !mobileMenu) return;
        mobileMenu.classList.add('hidden'); document.body.classList.remove('menu-open');
        button.setAttribute('aria-expanded', 'false'); button.innerHTML = '<i data-lucide="menu" class="w-5 h-5"></i>'; lucide.createIcons();
    };
    button?.addEventListener('click', () => {
        const isOpen = !mobileMenu.classList.contains('hidden');
        if (isOpen) return closeMenu();
        mobileMenu.classList.remove('hidden'); document.body.classList.add('menu-open');
        button.setAttribute('aria-expanded', 'true'); button.innerHTML = '<i data-lucide="x" class="w-5 h-5"></i>'; lucide.createIcons();
    });
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
    window.addEventListener('scroll', updateNavbar, { passive: true });
    window.addEventListener('resize', () => { if (innerWidth >= 768) closeMenu(); });
    updateNavbar();
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => anchor.addEventListener('click', event => {
        const selector = anchor.getAttribute('href');
        if (!selector || selector === '#') return;
        const target = document.querySelector(selector);
        if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }));
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', event => {
        event.preventDefault();
        const nombre = document.getElementById('nombre')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const servicio = document.getElementById('servicio')?.value || '';
        const mensaje = document.getElementById('mensaje')?.value.trim() || '';
        if (!nombre || !mensaje) return alert('Completá tu nombre y contanos brevemente tu idea.');
        const texto = ['Hola NEOLUZ Studio 👋', '', `Nombre: ${nombre}`, email ? `Email: ${email}` : null, `Servicio: ${servicio}`, `Proyecto: ${mensaje}`].filter(Boolean).join('\n');
        window.open(`https://wa.me/5492664252739?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer');
    });
}

function initAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        document.querySelectorAll('.reveal').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
        return;
    }
    gsap.registerPlugin(ScrollTrigger);
    gsap.from('.hero-kicker', { opacity:0, y:18, duration:.8, ease:'power3.out' });
    gsap.from('.hero-title', { opacity:0, y:50, duration:1.2, delay:.08, ease:'expo.out' });
    gsap.from('.hero-copy', { opacity:0, y:25, duration:.9, delay:.3, ease:'power3.out' });
    gsap.from('.hero-actions', { opacity:0, y:20, duration:.8, delay:.46, ease:'power3.out' });
    gsap.utils.toArray('.reveal').forEach((element, index) => gsap.to(element, { scrollTrigger:{ trigger:element, start:'top 88%', once:true }, opacity:1, y:0, duration:.95, delay:(index % 3) * .04, ease:'expo.out' }));
}

function initCanvas() {
    const canvas = document.getElementById('canvas-lines');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let particles = [], frame;
    const palette = ['139, 92, 246', '59, 130, 246', '34, 211, 238'];
    class Particle {
        constructor(){ this.reset(true); }
        reset(initial=false){ this.x=Math.random()*innerWidth; this.y=initial?Math.random()*innerHeight:innerHeight+Math.random()*120; this.length=Math.random()*95+30; this.speed=Math.random()*1.05+.22; this.opacity=Math.random()*.32+.04; this.color=palette[Math.floor(Math.random()*palette.length)]; }
        update(){ this.y-=this.speed; if(this.y+this.length<0) this.reset(); }
        draw(){ const g=ctx.createLinearGradient(this.x,this.y,this.x,this.y+this.length); g.addColorStop(0,`rgba(${this.color},0)`); g.addColorStop(.5,`rgba(${this.color},${this.opacity})`); g.addColorStop(1,`rgba(${this.color},0)`); ctx.strokeStyle=g; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(this.x,this.y); ctx.lineTo(this.x,this.y+this.length); ctx.stroke(); }
    }
    function resize(){ const ratio=Math.min(devicePixelRatio||1,2); canvas.width=Math.floor(innerWidth*ratio); canvas.height=Math.floor(innerHeight*ratio); canvas.style.width=`${innerWidth}px`; canvas.style.height=`${innerHeight}px`; ctx.setTransform(ratio,0,0,ratio,0,0); particles=Array.from({length:innerWidth<768?22:48},()=>new Particle()); }
    function animate(){ ctx.clearRect(0,0,innerWidth,innerHeight); particles.forEach(p=>{p.update();p.draw();}); frame=requestAnimationFrame(animate); }
    addEventListener('resize', resize); document.addEventListener('visibilitychange',()=>document.hidden?cancelAnimationFrame(frame):animate()); resize(); animate();
}
