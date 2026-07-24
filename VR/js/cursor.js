/*=========================================
            CUSTOM CURSOR
=========================================*/

const cursorDot = document.querySelector(".cursor-dot");

const cursorOutline = document.querySelector(".cursor-outline");

if (cursorDot && cursorOutline) {

    window.addEventListener("mousemove", (e) => {

        const x = e.clientX;

        const y = e.clientY;

        cursorDot.style.left = x + "px";

        cursorDot.style.top = y + "px";

        cursorOutline.animate({

            left: x + "px",

            top: y + "px"

        }, {

            duration: 200,

            fill: "forwards"

        });

    });

}


/*=========================================
        HOVER EFFECT
=========================================*/

const hoverItems = document.querySelectorAll(

    "a, button, .btn-primary, .btn-secondary, .skill-card, .project-card, .certificate-card"

);

hoverItems.forEach(item => {

    item.addEventListener("mouseenter", () => {

        if (!cursorOutline) return;

        cursorOutline.style.width = "60px";

        cursorOutline.style.height = "60px";

        cursorOutline.style.borderColor = "#06b6d4";

    });

    item.addEventListener("mouseleave", () => {

        if (!cursorOutline) return;

        cursorOutline.style.width = "35px";

        cursorOutline.style.height = "35px";

        cursorOutline.style.borderColor = "#c9a13b";

    });

});


/*=========================================
        CURSOR HIDE
=========================================*/

document.addEventListener("mouseleave", () => {

    if (!cursorDot || !cursorOutline) return;

    cursorDot.style.opacity = "0";

    cursorOutline.style.opacity = "0";

});

document.addEventListener("mouseenter", () => {

    if (!cursorDot || !cursorOutline) return;

    cursorDot.style.opacity = "1";

    cursorOutline.style.opacity = "1";

});


/*=========================================
        TOUCH DEVICES
=========================================*/

if ("ontouchstart" in window) {

    if (cursorDot) {

        cursorDot.style.display = "none";

    }

    if (cursorOutline) {

        cursorOutline.style.display = "none";

    }

}