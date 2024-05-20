document.addEventListener('DOMContentLoaded', function () {
    const accordions = document.querySelectorAll('.footer-block__heading');

    accordions.forEach(accordion => {
        accordion.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.accordion-icon');

            // Toggle active class on the accordion
            this.classList.toggle('active');

            if (this.classList.contains('active')) {
                // Open this accordion
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '-';
            } else {
                // Close this accordion
                content.style.maxHeight = '0';
                icon.textContent = '+';
            }

            // Close other accordions
            accordions.forEach(acc => {
                if (acc !== this && acc.classList.contains('active')) {
                    acc.classList.remove('active');
                    acc.nextElementSibling.style.maxHeight = '0';
                    acc.querySelector('.accordion-icon').textContent = '+';
                }
            });
        });
    });
});
