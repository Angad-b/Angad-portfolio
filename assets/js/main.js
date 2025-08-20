document.addEventListener('DOMContentLoaded', () => {

    // --- ASYNCHRONOUS DATA FETCHING ---
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error(`Could not fetch data from ${url}:`, error);
            return null;
        }
    }

    // --- INITIALIZE THE SITE ---
    async function initializeSite() {
        // Fetch all data concurrently
        const [projects, timelineEvents, config, skills] = await Promise.all([ // ADD skills
            fetchData('data/projects.json'),
            fetchData('data/timeline.json'),
            fetchData('data/config.json'),
            fetchData('data/skills.json') // ADD this line
        ]);

        // Render content if data is available
        if (projects) renderProjects(projects);
        if (timelineEvents) renderTimeline(timelineEvents);
        if (config) updateStaticContent(config);
        if (skills) renderSkills(skills); // ADD this line

        // Initialize all interactive elements
        initializeInteractiveElements();
    }

    // --- RENDER DYNAMIC CONTENT ---
    function renderProjects(projects) {
        const container = document.querySelector('#projects .grid-2');
        if (!container) return;
        container.innerHTML = projects.map(p => `
            <div class="project-card">
                <img src="${p.cover}" alt="${p.title}">
                <div class="project-card-content">
                    <h3>${p.title}</h3>
                    <p>${p.summary}</p>
                    <div class="project-tags">${p.stack.map(t => `<span>${t}</span>`).join('')}</div>
                    <a href="${p.link}" class="btn btn-outline">Case Study</a>
                </div>
            </div>
        `).join('');
    }

    function renderSkills(skills) {
        const marqueeContainers = document.querySelectorAll('.skills-marquee');
        if (!marqueeContainers.length) return;

        const skillColors = ['#9F9CF3', '#A7F3D0', '#FECACA', '#FDE68A', '#BFDBFE'];
        let colorIndex = 0;

        const skillChipsHTML = skills.map(skill => {
            const color = skillColors[colorIndex % skillColors.length];
            colorIndex++;
            return `
                <div class="skill-chip" style="background-color: ${color}; color: #0F1226;">
                    <span>${skill.name}</span>
                    <span class="skill-level">${skill.level}%</span>
                </div>
            `;
        }).join('');

        marqueeContainers.forEach(container => {
            container.innerHTML = skillChipsHTML;
        });
    }

    function renderTimeline(timelineEvents) {
        const container = document.querySelector('.timeline-container');
        if (!container) return;
        timelineEvents.forEach((event, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.transitionDelay = `${index * 0.15}s`;
            item.innerHTML = `
                <div class="timeline-date">${event.date}</div>
                <h3 class="timeline-title">${event.title}</h3>
                <p>${event.description}</p>
            `;
            container.appendChild(item);
        });
    }
    
    // --- UPDATE STATIC CONTENT ---
    function updateStaticContent(config) {
        // Example: Update resume link if it exists
        const resumeLink = document.querySelector('a[href="#"]'); // A more specific selector is better
        if (resumeLink && config.resumeUrl) {
            resumeLink.href = config.resumeUrl;
        }
    }

    // --- INITIALIZE INTERACTIVE ELEMENTS (All the old code goes here) ---
    function initializeInteractiveElements() {
        lucide.createIcons();

        // --- STATS COUNTER ANIMATION ---
        const animateStatNumbers = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = +el.getAttribute('data-target');
                    let current = 0;
                    const increment = target / 100;

                    const updateCount = () => {
                        current += increment;
                        if (current < target) {
                            el.innerText = Math.ceil(current);
                            requestAnimationFrame(updateCount);
                        } else {
                            el.innerText = target;
                        }
                    };
                    requestAnimationFrame(updateCount);
                    observer.unobserve(el);
                }
            });
        };
        const statObserver = new IntersectionObserver(animateStatNumbers, { threshold: 0.5 });
        document.querySelectorAll('.stat-number').forEach(num => statObserver.observe(num));

        
        // Custom cursor logic...
        const cursorDot = document.getElementById('cursor-dot');
        const cursorOutline = document.getElementById('cursor-outline');
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });

        // Navbar scroll logic...
        const navbar = document.getElementById('navbar');
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
            if (lastScrollY < window.scrollY && window.scrollY > 100) {
                navbar.classList.add('hidden');
            } else {
                navbar.classList.remove('hidden');
            }
            lastScrollY = window.scrollY;
        });

        // Theme toggle logic...
        const themeToggle = document.getElementById('theme-toggle');
        const html = document.documentElement;
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            html.classList.toggle('light');
        });

        // Mobile menu logic...
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.add('visible'));
        mobileMenuClose.addEventListener('click', () => mobileMenu.classList.remove('visible'));

        // Intersection Observer for scroll animations...
        const animatedElements = document.querySelectorAll('.animated-section, .timeline-container');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        animatedElements.forEach(el => observer.observe(el));

        // Parallax scrolling logic...
        const heroContent = document.querySelector('#hero .container');
        const background = document.getElementById('animated-background');
        window.addEventListener('scroll', () => {
            const offset = window.pageYOffset;
            if(heroContent) {
                heroContent.style.transform = `translateY(${offset * 0.4}px)`;
                heroContent.style.opacity = 1 - offset / 600;
            }
            background.style.transform = `translateY(${offset * 0.5}px)`;
        });
    }

    // --- START THE APP ---
    initializeSite();
});