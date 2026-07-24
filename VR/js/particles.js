/*=========================================
        PARTICLES.JS
=========================================*/

if (typeof particlesJS !== "undefined") {

    particlesJS("particles-js", {

        particles: {

            number: {

                value: 28,

                density: {

                    enable: true,

                    value_area: 1100

                }

            },

            color: {

                value: "#e8b93f"

            },

            shape: {

                type: "circle"

            },

            opacity: {

                value: 0.25,

                random: true

            },

            size: {

                value: 2,

                random: true

            },

            line_linked: {

                enable: false,

                distance: 150,

                color: "#c9a13b",

                opacity: 0.3,

                width: 1

            },

            move: {

                enable: true,

                speed: 0.6,

                direction: "none",

                random: true,

                straight: false,

                out_mode: "out",

                bounce: false

            }

        },

        interactivity: {

            detect_on: "canvas",

            events: {

                onhover: {

                    enable: true,

                    mode: "bubble"

                },

                onclick: {

                    enable: true,

                    mode: "push"

                },

                resize: true

            },

            modes: {

                bubble: {

                    distance: 130,

                    size: 4,

                    duration: 2,

                    opacity: 0.5

                },

                push: {

                    particles_nb: 3

                }

            }

        },

        retina_detect: true

    });

}


/*=========================================
        WINDOW RESIZE
=========================================*/

window.addEventListener("resize", () => {

    if (typeof pJSDom !== "undefined" && pJSDom.length > 0) {

        pJSDom[0].pJS.fn.vendors.densityAutoParticles();

    }

});


console.log("Particles Loaded Successfully");