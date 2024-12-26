import { onCarouselChange } from "../carousel";

Array.from(document.getElementsByClassName("Carousel")).forEach(element => {
    window.onresize = function(){
      //@ts-expect-error
      onCarouselChange(element);
    }
    //@ts-expect-error
    onCarouselChange(element);
});
