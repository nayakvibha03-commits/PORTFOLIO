/*=========================================
        PAGE LOADER
=========================================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

        setTimeout(() => {

            loader.style.display = "none";

        }, 500);

    }

});


/*=========================================
        MOBILE MENU
=========================================*/

const menuBtn = document.querySelector(".menu-btn");

const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });

}


/*=========================================
        CLOSE MENU AFTER CLICK
=========================================*/

document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

    });

});


/*=========================================
        SCROLL PROGRESS BAR
=========================================*/

const progressBar = document.getElementById("progress-bar");

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;

    const pageHeight = document.documentElement.scrollHeight - window.innerHeight;

    const progress = (scrollTop / pageHeight) * 100;

    if (progressBar) {

        progressBar.style.width = progress + "%";

    }

});


/*=========================================
        BACK TO TOP BUTTON
=========================================*/

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (!backToTop) return;

    if (window.scrollY > 400) {

        backToTop.style.display = "flex";

    } else {

        backToTop.style.display = "none";

    }

});

if (backToTop) {

    backToTop.style.display = "none";

    backToTop.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


/*=========================================
        ACTIVE NAVIGATION
=========================================*/

const sections = document.querySelectorAll("section");

const navItems = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 150;

        const sectionHeight = section.offsetHeight;

        if (window.scrollY >= sectionTop) {

            current = section.getAttribute("id");

        }

    });

    navItems.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});


/*=========================================
        COUNTER ANIMATION
=========================================*/

const counters = document.querySelectorAll(".counter");

let counterStarted = false;

function startCounters() {

    if (counterStarted) return;

    const statsSection = document.querySelector(".stats");

    if (!statsSection) return;

    const sectionTop = statsSection.getBoundingClientRect().top;

    if (sectionTop < window.innerHeight - 100) {

        counterStarted = true;

        counters.forEach(counter => {

            const target = Number(counter.dataset.target);

            let count = 0;

            const speed = target / 80;

            function updateCounter() {

                count += speed;

                if (count < target) {

                    counter.innerText = Math.ceil(count);

                    requestAnimationFrame(updateCounter);

                } else {

                    counter.innerText = target;

                }

            }

            updateCounter();

        });

    }

}

window.addEventListener("scroll", startCounters);

window.addEventListener("load", startCounters);


/*=========================================
        SMOOTH SCROLL
=========================================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/*=========================================
        CURRENT YEAR (OPTIONAL)
=========================================*/

const yearElement = document.getElementById("currentYear");

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}


/*=========================================
        CONSOLE MESSAGE
=========================================*/

console.log("===================================");

console.log("Portfolio Developed by Vibha R");

console.log("Full Stack Developer Portfolio");

console.log("===================================");
/*=========================================
        PROJECT MODAL
=========================================*/

const openButtons = document.querySelectorAll(".open-modal");

const modals = document.querySelectorAll(".project-modal");

const closeButtons = document.querySelectorAll(".close-modal");


/*=========================================
        MODAL <-> BROWSER HISTORY
        Pressing the phone/browser Back button
        should close the project modal instead
        of leaving the page (which used to force
        a full refresh, replaying the intro).
=========================================*/

function openProjectModal(modal, pushHistory){

    if(!modal) return;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    if(pushHistory){

        history.pushState({ modal: modal.id }, "", "#" + modal.id);

    }

}

function closeProjectModal(modal, fromPopstate){

    if(!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "auto";

    if(!fromPopstate && history.state && history.state.modal === modal.id){

        history.back();

    }

}

function closeAllModals(fromPopstate){

    modals.forEach(modal => closeProjectModal(modal, fromPopstate));

}

window.addEventListener("popstate", () => {

    // Any open modal gets closed when the user hits Back —
    // the page itself never has to reload.
    closeAllModals(true);

});


/*=========================================
        OPEN MODAL
=========================================*/

openButtons.forEach(button => {

    button.addEventListener("click", () => {

        const modalId = button.dataset.modal;

        const modal = document.getElementById(modalId);

        openProjectModal(modal, true);

    });

});


/*=========================================
        CLOSE BUTTON
=========================================*/

closeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const modal = button.closest(".project-modal");

        closeProjectModal(modal, false);

    });

});


/*=========================================
        CLICK OUTSIDE
=========================================*/

modals.forEach(modal => {

    modal.addEventListener("click", (e)=>{

        if(e.target === modal){

            closeProjectModal(modal, false);

        }

    });

});


/*=========================================
        ESC KEY
=========================================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        closeAllModals(false);

    }

});


/*=========================================
        LIVE DEMO SECTION — TABS
=========================================*/

const demoTabs = document.querySelectorAll(".demo-tab");

const demoPanels = document.querySelectorAll(".demo-panel");

function activateDemoTab(key){

    if(!key) return;

    if(key !== "triSense" && typeof stopFaceCamera === "function"){
        stopFaceCamera();
    }

    demoTabs.forEach(tab => {

        tab.classList.toggle("active", tab.dataset.demoTab === key);

    });

    demoPanels.forEach(panel => {

        panel.classList.toggle("active", panel.id === "panel-" + key);

    });

}

demoTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        activateDemoTab(tab.dataset.demoTab);

    });

});


/*=========================================
        "TRY LIVE DEMO" BUTTONS INSIDE
        PROJECT MODALS — close the modal,
        switch to the right tab, and scroll
        down to the Live Demo section.
=========================================*/

document.querySelectorAll("[data-goto-demo]").forEach(button => {

    button.addEventListener("click", () => {

        const key = button.dataset.gotoDemo;

        const modal = button.closest(".project-modal");

        closeProjectModal(modal, false);

        activateDemoTab(key);

        const liveDemoSection = document.getElementById("live-demo");

        if(liveDemoSection){

            setTimeout(() => {

                liveDemoSection.scrollIntoView({ behavior: "smooth", block: "start" });

            }, 150);

        }

    });

});
/*=========================================
        NAVBAR SCROLL EFFECT
=========================================*/

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(!navbar) return;

    if(window.scrollY>80){

        navbar.style.background="rgba(8,17,31,.92)";

        navbar.style.backdropFilter="blur(14px)";

        navbar.style.boxShadow="0 10px 30px rgba(0,0,0,.25)";

    }

    else{

        navbar.style.background="transparent";

        navbar.style.backdropFilter="blur(0px)";

        navbar.style.boxShadow="none";

    }

});
/*=========================================
        CONTACT FORM
        (no backend server, so this opens
        the visitor's email app with the
        message pre-filled to send to you)
=========================================*/

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function (e) {

        e.preventDefault();

        const inputs = contactForm.querySelectorAll("input");

        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const subject = inputs[2].value.trim();
        const message = contactForm.querySelector("textarea").value.trim();

        if (!name || !email || !subject || !message) {
            alert("Please fill in all fields before sending.");
            return;
        }

        const body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;

        const mailtoLink = "mailto:nayakvibha03@gmail.com"
            + "?subject=" + encodeURIComponent(subject)
            + "&body=" + encodeURIComponent(body);

        window.location.href = mailtoLink;

        contactForm.reset();

    });

}
