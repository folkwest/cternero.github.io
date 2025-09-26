window.addEventListener('scroll', () => {
  document.body.style.setProperty('--scroll',window.pageYOffset / (document.body.offsetHeight - window.innerHeight));
}, false);


const Utils = {
    select(selector) {
        return document.querySelector(selector);
    },

    selectAll(selector) {
        return document.querySelectorAll(selector);
    },

    // Throttle function for performance optimization
    throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;

        return function (...args) {
            const currentTime = Date.now();
            const timeSinceLastExec = currentTime - lastExecTime;

            if (timeSinceLastExec > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - timeSinceLastExec);
            }
        };
    },
};

class ConfigLoader {
    static async load() {
        try {
            const response = await fetch("/assets/config.json");
            return response.ok ? await response.json() : null;
        } catch (error) {
            console.warn("Could not load config.json:", error.message);
            return null;
        }
    }
}

class NavigationHighlighter {
    constructor() {
        this.sections = this.mapSections();
        this.threshold = window.innerHeight * 0.3;

        this.init();
    }

    init() {
        if (this.sections.length === 0) return;

        this.handleScroll = Utils.throttle(
            this.updateActiveSection.bind(this),
            100,
        );
        window.addEventListener("scroll", this.handleScroll, { passive: true });
        this.updateActiveSection();
    }

    mapSections() {
        const navLinks = Utils.selectAll("aside nav a");
        const sections = [];

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            let element = null;
            let isAbout = false;

            if (href === "#") {
                element = document.body;
                isAbout = true;
            } else if (href?.startsWith("#")) {
                element = document.getElementById(href.substring(1));
            }

            if (element) {
                sections.push({ link, element, isAbout });
            }
        });

        return sections;
    }

    updateActiveSection() {
        const scrollTop = window.pageYOffset;
        let activeSection = null;

        // Check if we're at the top (About section)
        if (scrollTop < this.threshold) {
            activeSection = this.sections.find((s) => s.isAbout);
        } else {
            // Find the current section based on scroll position
            for (let i = this.sections.length - 1; i >= 0; i--) {
                const section = this.sections[i];
                if (!section.isAbout) {
                    const rect = section.element.getBoundingClientRect();
                    if (rect.top <= this.threshold) {
                        activeSection = section;
                        break;
                    }
                }
            }
        }

        // Update active states
        this.sections.forEach((section) => {
            const isActive = section === activeSection;

            if (isActive) {
                section.link.setAttribute("data-active", "true");
            } else {
                section.link.removeAttribute("data-active");
            }
        });
    }
}
class AboutLinkHandler {
    constructor() {
        this.aboutLink = Utils.select('aside nav a[href="#"]');
        this.init();
    }

    init() {
        if (!this.aboutLink) return;

        this.aboutLink.addEventListener("click", this.handleClick.bind(this));
    }

    handleClick(e) {
        e.preventDefault();

        // Clean URL
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState(null, null, cleanUrl);

        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}


class App {
    constructor() {
        this.components = [];
    }

    async init() {
        // Mark body as JS-enabled
        document.body.setAttribute("data-js", "");

        // Load configuration
        const config = await ConfigLoader.load();

        // Initialize components
        this.initializeComponents(config);
    }

    initializeComponents(config) {
        // About link handler
        this.components.push(new AboutLinkHandler());

        // Navigation highlighter
        this.components.push(new NavigationHighlighter());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new App();
    app.init();
});

