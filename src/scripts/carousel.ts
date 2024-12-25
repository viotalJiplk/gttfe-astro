const scrollStep = 200;

export function onCarouselChange(element: HTMLDivElement) {
    const container = element as HTMLDivElement;
    //@ts-expect-error
    const carouselControls = element.parentElement.getElementsByClassName('Carousel-controls')[0] as HTMLDivElement;
    //@ts-expect-error
    const leftButton = container.parentElement.getElementsByClassName('Carousel-left')[0] as HTMLButtonElement;
    //@ts-expect-error
    const rightButton = container.parentElement.getElementsByClassName('Carousel-right')[0] as HTMLButtonElement;
    if((container.scrollWidth - container.clientWidth) > 0){
        carouselControls.style.display = "flex";
    }
    scrollHandler(container);
    container.addEventListener('scroll', event=>{scrollHandler(container)});

    rightButton.addEventListener("click", event => {
        const scrollRight = container.scrollWidth - container.clientWidth - container.scrollLeft;
        if((scrollRight - scrollStep) < (scrollStep/2)){
            container.scrollBy(scrollRight, 0);
        }else{
            container.scrollBy(scrollStep, 0);
        }
    });
    leftButton.addEventListener("click", event => {
        if((container.scrollLeft-scrollStep) < (scrollStep/2)){
            container.scrollBy(-container.scrollLeft, 0);
        }else{
            container.scrollBy(-scrollStep, 0);
        }
    });
}

function scrollHandler(container: HTMLDivElement){
    //@ts-expect-error
    const leftButton = container.parentElement.getElementsByClassName('Carousel-left')[0] as HTMLButtonElement;
    //@ts-expect-error
    const rightButton = container.parentElement.getElementsByClassName('Carousel-right')[0] as HTMLButtonElement;
    if (((container.scrollLeft + container.clientWidth) > (container.scrollWidth - 1)) && !rightButton.classList.contains("Carousel-disabled")) {
        rightButton.classList.add("Carousel-disabled");
    } else if (((container.scrollLeft + container.clientWidth) <= (container.scrollWidth - 1)) && rightButton.classList.contains("Carousel-disabled")) {
        rightButton.classList.remove("Carousel-disabled");
    }
    if ((container.scrollLeft == 0) && !leftButton.classList.contains("Carousel-disabled")) {
        leftButton.classList.add("Carousel-disabled");
    } else if ((container.scrollLeft != 0) && leftButton.classList.contains("Carousel-disabled")) {
        leftButton.classList.remove("Carousel-disabled");
    }
}

export function carouselAppendChild(carousel: HTMLDivElement, node: Node){
    carousel.appendChild(node);
    for (const img of carousel.querySelectorAll("img")) {
        img.onload = function () {
            onCarouselChange(carousel);
        }
    }
    onCarouselChange(carousel);
}