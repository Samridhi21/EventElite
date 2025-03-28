document.querySelectorAll('.carousel-container').forEach((container, index) => {
    let currentIndex = 0;
    const carousel = container.querySelector('.carousel');
    const slides = container.querySelectorAll('.carousel-item');
    const totalSlides = slides.length;

    function showSlide(i) {
        if (i >= totalSlides) {
            currentIndex = 0;
        } else if (i < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = i;
        }
        const offset = -currentIndex * 100 + "%";
        carousel.style.transform = `translateX(${offset})`;
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function prevSlide() {
        showSlide(currentIndex - 1);
    }

    container.querySelector('.controls button:nth-child(1)').addEventListener('click', prevSlide);
    container.querySelector('.controls button:nth-child(2)').addEventListener('click', nextSlide);

    setInterval(nextSlide, 7000);
});

let currentSlide = 0;
const slides = document.querySelectorAll(".slide");

function showSlide(index) {
    slides.forEach((slide, i) => {
        slide.style.opacity = i === index ? "1" : "0";
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Initialize first slide
showSlide(currentSlide);

