/*=========================================
        GSAP SCROLLTRIGGER
=========================================*/

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {

    gsap.registerPlugin(ScrollTrigger);

}
/*=========================================
        AOS INITIALIZATION
=========================================*/

if (typeof AOS !== "undefined") {

    AOS.init({

        duration: 1000,

        once: true,

        offset: 100,

        easing: "ease-in-out"

    });

}

/*=========================================
        AOS SAFETY NET
        (forces content visible even if the
        AOS library fails to load, e.g. on
        slow or restricted networks)
=========================================*/

window.addEventListener("load", function () {

    setTimeout(function () {

        document.querySelectorAll("[data-aos]").forEach(function (el) {

            el.classList.add("aos-animate");

            el.style.opacity = "1";

            el.style.transform = "none";

        });

    }, 1200);

});


/*=========================================
        TYPED.JS
=========================================*/

if (typeof Typed !== "undefined") {

    const typingElement = document.querySelector(".typing");

    if (typingElement) {

        new Typed(".typing", {

            strings: [

                "Computer Science Engineer",

                "Future Full Stack Developer",

                "AI Enthusiast",

                "Problem Solver"

            ],

            typeSpeed: 70,

            backSpeed: 45,

            backDelay: 1800,

            loop: true,

            smartBackspace: true

        });

    }

}


/*=========================================
        VANILLA TILT
=========================================*/

if (typeof VanillaTilt !== "undefined") {

    VanillaTilt.init(

        document.querySelectorAll(

            ".skill-card, .project-card, .certificate-card, .why-card, .experience-card"

        ),

        {

            max: 8,

            speed: 400,

            glare: true,

            "max-glare": 0.2,

            scale: 1.03

        }

    );

}


/*=========================================
        GSAP HERO ANIMATION
=========================================*/

if (typeof gsap !== "undefined") {

    gsap.from(".hero-left", {

        x: -100,

        opacity: 0,

        duration: 1.2,

        ease: "power3.out"

    });

    gsap.from(".hero-right", {

        x: 100,

        opacity: 0,

        duration: 1.2,

        delay: 0.3,

        ease: "power3.out"

    });

    gsap.from(".navbar", {

        y: -80,

        opacity: 0,

        duration: 1,

        ease: "power3.out"

    });

}


/*=========================================
        SECTION TITLE & CARD ANIMATION
        (handled by AOS via data-aos attributes
        on these elements - see AOS_SAFETY NET
        above; GSAP duplicate removed to avoid
        two animation systems fighting)
=========================================*/


/*=========================================
        BUTTON HOVER SCALE
=========================================*/

document.querySelectorAll(

    ".btn-primary, .btn-secondary"

).forEach((button) => {

    button.addEventListener("mouseenter", () => {

        button.style.transform = "scale(1.05)";

    });

    button.addEventListener("mouseleave", () => {

        button.style.transform = "scale(1)";

    });

});


/*=========================================
        PROFILE IMAGE HOVER
=========================================*/

const profileCard = document.querySelector(".profile-card");

if (profileCard) {

    profileCard.addEventListener("mouseenter", () => {

        profileCard.style.transform =

            "translateY(-10px) scale(1.02)";

    });

    profileCard.addEventListener("mouseleave", () => {

        profileCard.style.transform =

            "translateY(0) scale(1)";

    });

}


/*=========================================
        SOCIAL ICON HOVER
=========================================*/

document.querySelectorAll(".social-icons a").forEach((icon) => {

    icon.addEventListener("mouseenter", () => {

        icon.style.transform =

            "translateY(-6px) rotate(360deg)";

    });

    icon.addEventListener("mouseleave", () => {

        icon.style.transform =

            "translateY(0) rotate(0deg)";

    });

});


/*=========================================
        FOOTER ICON HOVER
=========================================*/

document.querySelectorAll(".footer-social a").forEach((icon) => {

    icon.addEventListener("mouseenter", () => {

        icon.style.transform =

            "translateY(-6px) rotate(360deg)";

    });

    icon.addEventListener("mouseleave", () => {

        icon.style.transform =

            "translateY(0) rotate(0deg)";

    });

});


/*=========================================
        IMAGE HOVER EFFECT
=========================================*/

document.querySelectorAll(".project-card img").forEach((image) => {

    image.addEventListener("mouseenter", () => {

        image.style.transform = "scale(1.08)";

    });

    image.addEventListener("mouseleave", () => {

        image.style.transform = "scale(1)";

    });

});


/*=========================================
        END
=========================================*/