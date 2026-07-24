/*=========================================================
    CINEMATIC LAYER — JS
    Movie-trailer style opening sequence, ambient grain/vignette,
    a letter-by-letter title reveal, focus-pull scroll reveals,
    and a hero spotlight that tracks the cursor.
=========================================================*/

(function () {

    /*-----------------------------------------------------
        0. Respect reduced-motion users, and only ever play
        the full trailer once per browser session — a
        refresh or a Back navigation within the same tab
        should NOT replay the intro from scratch.
    -----------------------------------------------------*/
    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    let introAlreadyPlayed = false;
    try{
        introAlreadyPlayed = sessionStorage.getItem("introPlayed") === "1";
        sessionStorage.setItem("introPlayed", "1");
    }catch(err){
        // sessionStorage unavailable (e.g. private mode) — just play it once anyway
    }

    const skipTrailerEntirely = prefersReducedMotion || introAlreadyPlayed;

    /*-----------------------------------------------------
        1. INJECT LETTERBOX / GRAIN / VIGNETTE
    -----------------------------------------------------*/
    const letterboxTop = document.createElement("div");
    letterboxTop.className = "cine-letterbox cine-letterbox-top";

    const letterboxBottom = document.createElement("div");
    letterboxBottom.className = "cine-letterbox cine-letterbox-bottom";

    const grain = document.createElement("div");
    grain.className = "cine-grain";

    const vignette = document.createElement("div");
    vignette.className = "cine-vignette";

    document.body.appendChild(letterboxTop);
    document.body.appendChild(letterboxBottom);
    document.body.appendChild(grain);
    document.body.appendChild(vignette);

    function openCurtain() {
        requestAnimationFrame(() => {
            letterboxTop.classList.add("is-open");
            letterboxBottom.classList.add("is-open");
        });
    }

    /*-----------------------------------------------------
        2. MOVIE TRAILER OPENING SEQUENCE
        "Studio" card -> title crash-zoom -> tagline,
        then the curtain opens into the real hero.
    -----------------------------------------------------*/
    const INTRO_MS = 4700; // total trailer runtime before curtain opens

    const trailer = document.createElement("div");
    trailer.className = "cine-trailer";
    trailer.innerHTML = `
        <div class="cine-trailer-card cine-card-studio">
            <i class="fa-solid fa-film cine-reel-icon"></i>
            <p class="cine-eyebrow">VR presents</p>
        </div>
        <div class="cine-trailer-card cine-card-title">
            <h2 class="cine-trailer-name">Vibha&nbsp;R</h2>
            <div class="cine-trailer-flare"></div>
        </div>
        <div class="cine-trailer-card cine-card-tagline">
            <p>Full Stack Developer&nbsp;&nbsp;•&nbsp;&nbsp;AI Enthusiast</p>
            <p class="cine-trailer-sub">In theatres on scroll</p>
        </div>
        <button type="button" class="cine-skip-btn">Skip Intro <i class="fa-solid fa-forward-step"></i></button>
    `;

    let introFinished = false;
    let skipTimer = null;
    let finishIntro = function () {
        if (introFinished) return;
        introFinished = true;
        clearTimeout(skipTimer);
        trailer.classList.add("is-hiding");
        openCurtain();
        setTimeout(() => trailer.remove(), 700);
    };

    if (skipTrailerEntirely) {
        letterboxTop.style.display = "none";
        letterboxBottom.style.display = "none";
    } else {
        document.body.appendChild(trailer);

        const skipBtn = trailer.querySelector(".cine-skip-btn");
        if (skipBtn) skipBtn.addEventListener("click", () => finishIntro());

        window.addEventListener("load", () => {
            // Give the real page loader its usual moment, then roll the trailer
            setTimeout(() => {
                trailer.classList.add("is-playing");
                skipTimer = setTimeout(() => finishIntro(), INTRO_MS);
            }, 550);
        });
    }

    /*-----------------------------------------------------
        3. TITLE SEQUENCE — split hero name into letters
        (snapshot childNodes first — mutating a *live*
        NodeList mid-iteration was skipping the "R" span)
    -----------------------------------------------------*/
    function wrapLettersIn(node, delayRef, extraClass) {
        const children = Array.from(node.childNodes);
        children.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                [...child.textContent].forEach((ch) => {
                    if (/\s/.test(ch)) {
                        frag.appendChild(document.createTextNode(ch));
                        return;
                    }
                    const span = document.createElement("span");
                    span.className = extraClass
                        ? `cine-letter ${extraClass}`
                        : "cine-letter";
                    span.textContent = ch;
                    span.style.animationDelay = `${delayRef.value}s`;
                    delayRef.value += 0.045;
                    frag.appendChild(span);
                });
                child.replaceWith(frag);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                wrapLettersIn(child, delayRef, extraClass);
            }
        });
    }

    const heroRevealDelay = skipTrailerEntirely ? 0 : INTRO_MS / 1000 + 0.35;

    if (!skipTrailerEntirely) {
        // "Hello, I'm" lands a beat before the name does
        const welcome = document.querySelector(".hero-left .welcome");
        if (welcome) {
            welcome.classList.add("cine-subtitle-in");
            welcome.style.animationDelay = `${Math.max(0, heroRevealDelay - 0.45)}s`;
        }

        const heroTitle = document.querySelector(".hero-left h1");
        if (heroTitle) {
            heroTitle.classList.add("cine-hero-title-in");
            heroTitle.style.animationDelay = `${heroRevealDelay}s`;
        }

        // Fade the rest of the hero copy in right after the title lands
        [
            ".hero-left .hero-description",
            ".hero-left .hero-buttons",
            ".hero-left .social-icons",
        ].forEach((sel, i) => {
            const el = document.querySelector(sel);
            if (el) {
                el.classList.add("cine-subtitle-in");
                el.style.animationDelay = `${heroRevealDelay + 0.75 + i * 0.15}s`;
            }
        });

        // If the user skips the intro early, snap the hero-reveal timers
        // forward so nothing is left waiting on the full INTRO_MS delay.
        const baseFinish = finishIntro;
        finishIntro = function () {
            if (introFinished) return;
            if (welcome) welcome.style.animationDelay = "0s";
            if (heroTitle) heroTitle.style.animationDelay = "0.15s";
            document
                .querySelectorAll(
                    ".hero-description.cine-subtitle-in, .hero-buttons.cine-subtitle-in, .social-icons.cine-subtitle-in"
                )
                .forEach((el, i) => {
                    el.style.animationDelay = `${0.6 + i * 0.1}s`;
                });
            baseFinish();
        };

        // HARD SAFETY NET: no matter what happens with the trailer timing,
        // slow CDNs, or a stray script error, force the name and hero copy
        // fully visible after a fixed real-world timeout.
        setTimeout(() => {
            [welcome, heroTitle, ...document.querySelectorAll(".cine-subtitle-in")].forEach(
                (el) => {
                    if (!el) return;
                    el.style.opacity = "1";
                    el.style.filter = "none";
                    el.style.transform = "none";
                }
            );
        }, 9000);
    }

    /*-----------------------------------------------------
        3b. SECTION TITLE CARDS — letter-by-letter reveal
        every time a heading scrolls into view (About,
        Education, Skills, Projects, Certificates, Contact)
    -----------------------------------------------------*/
    if (!prefersReducedMotion && "IntersectionObserver" in window) {
        const titleHeadings = document.querySelectorAll(".section-title h2");

        titleHeadings.forEach((heading) => {
            wrapLettersIn(heading, { value: 0 }, "cine-section-letter");
            heading
                .querySelectorAll(".cine-section-letter")
                .forEach((el) => (el.style.animationPlayState = "paused"));
        });

        const titleObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target
                            .querySelectorAll(".cine-section-letter")
                            .forEach((el) => {
                                el.style.animationPlayState = "running";
                            });
                        titleObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.4 }
        );

        titleHeadings.forEach((heading) => titleObserver.observe(heading));
    } else {
        document.querySelectorAll(".section-title h2").forEach((heading) => {
            heading.style.opacity = "1";
        });
    }

    /*-----------------------------------------------------
        4. FOCUS-PULL SCROLL REVEALS
    -----------------------------------------------------*/
    const focusSelectors = [
        ".section-title",
        ".project-card",
        ".skill-card",
        ".certificate-card",
        ".about-image",
        ".about-content",
        ".timeline-item",
    ];

    const focusTargets = document.querySelectorAll(focusSelectors.join(","));

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        focusTargets.forEach((el) => el.classList.add("cine-focus", "in-view"));
    } else {
        focusTargets.forEach((el, i) => {
            el.classList.add("cine-focus");
            el.style.transitionDelay = `${(i % 3) * 0.12}s`;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("in-view");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
        );

        focusTargets.forEach((el) => observer.observe(el));
    }

    /*-----------------------------------------------------
        5. HERO SPOTLIGHT — follows the cursor
    -----------------------------------------------------*/
    const hero = document.querySelector(".hero");
    if (hero && !prefersReducedMotion) {
        hero.addEventListener("mousemove", (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            hero.style.setProperty("--mx", `${x}%`);
            hero.style.setProperty("--my", `${y}%`);
        });
    }

})();
