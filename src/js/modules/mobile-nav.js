function mobileNav() {
    // Mobile nav button
    const navBtn = document.querySelector(".mobile-nav-btn");
    const nav = document.querySelector(".mobile-nav");
    const menuIcon = document.querySelector(".nav-icon");

    navBtn.addEventListener("click", () => {
        nav.classList.toggle("mobile-nav--open"); // навигация выезжает сверху
        menuIcon.classList.toggle("nav-icon--active"); // бургер в крестик
        document.body.classList.toggle("no-scroll"); // нет с крола у боди
    });
}

export default mobileNav;
