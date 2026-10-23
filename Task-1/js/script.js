
/* =====================================
   TECHNOVA - MAIN JAVASCRIPT
   Works across all four HTML pages
===================================== */


/* 1. MOBILE NAVIGATION MENU */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", function () {

        // Show or hide the navigation links
        navLinks.classList.toggle("show");

        // Update the accessibility information
        const isOpen = navLinks.classList.contains("show");

        menuToggle.setAttribute("aria-expanded", isOpen);
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        // Change the hamburger icon
        const menuIcon = menuToggle.querySelector("i");

        if (menuIcon) {
            if (isOpen) {
                menuIcon.classList.remove("fa-bars");
                menuIcon.classList.add("fa-xmark");
            } else {
                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");
            }
        }
    });

    // Close the menu after clicking a navigation link
    navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            navLinks.classList.remove("show");

            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

            const menuIcon = menuToggle.querySelector("i");

            if (menuIcon) {
                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");
            }
        });
    });

    // Close the menu when the screen becomes larger
    window.addEventListener("resize", function () {
        if (window.innerWidth > 768) {
            navLinks.classList.remove("show");
            menuToggle.setAttribute("aria-expanded", "false");

            const menuIcon = menuToggle.querySelector("i");

            if (menuIcon) {
                menuIcon.classList.remove("fa-xmark");
                menuIcon.classList.add("fa-bars");
            }
        }
    });
}


/* =====================================
   2. CONTACT FORM VALIDATION
===================================== */

// This works only on pages that contain a contact form.
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {

        // Stop submission if required fields are invalid
        if (!contactForm.checkValidity()) {
            event.preventDefault();
            contactForm.reportValidity();
            return;
        }

        // Prevent a page reload when no form backend is configured
        event.preventDefault();

        // Display a message to the visitor
        const feedback = document.querySelector(".form-feedback");

        if (feedback) {
            feedback.textContent =
                "Thank you! Your form passed validation. " +
                "This demo does not send messages to a server.";
        } else {
            alert(
                "Thank you! Your form passed validation. " +
                "This demo does not send messages to a server."
            );
        }

        // Clear the form after successful validation
        contactForm.reset();
    });
}


/* =====================================
   3. CURRENT YEAR IN THE FOOTER
===================================== */

// Update the year automatically if a year element exists.
const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}
