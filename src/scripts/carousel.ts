Array.from(document.getElementsByClassName("Carousel-left")).forEach(element => {
    element.addEventListener("click", event => {
        //@ts-expect-error
        let container = event.target.parentElement.parentElement.getElementsByClassName('Carousel')[0];
        //@ts-expect-error
        let leftButton = event.target.parentElement.getElementsByClassName('Carousel-left')[0];
        //@ts-expect-error
        let rightButton = event.target.parentElement.getElementsByClassName('Carousel-right')[0];
        container.scrollBy(-200, 0);
        rightButton.classList.remove("Carousel-disabled");
        if (container.scrollLeft == 0) {
            leftButton.classList.add("Carousel-disabled");
        }
    });
});
Array.from(document.getElementsByClassName("Carousel-right")).forEach(element => {
    element.addEventListener("click", event => {
        //@ts-expect-error
        let container = event.target.parentElement.parentElement.getElementsByClassName('Carousel')[0];
        //@ts-expect-error
        let leftButton = event.target.parentElement.getElementsByClassName('Carousel-left')[0];
        //@ts-expect-error
        let rightButton = event.target.parentElement.getElementsByClassName('Carousel-right')[0];
        container.scrollBy(200, 0);
        leftButton.classList.remove("Carousel-disabled");
        if ((container.scrollLeft + container.clientWidth) > (container.scrollWidth - 1)) {
            rightButton.classList.add("Carousel-disabled");
        }
    });
});