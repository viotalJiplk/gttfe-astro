let uniqueId = 0;
function getUniqueId() {
    return ++uniqueId;
}


/**
 * Represents a rectangle's boundary and center point.
 *
 * @typedef {Object} Bounds
 * @property {number} left - The left (x) coordinate.
 * @property {number} right - The right (x) coordinate.
 * @property {number} top - The top (y) coordinate.
 * @property {number} bottom - The bottom (y) coordinate.
 * @property {{x: number, y: number}} middle - The center point of the rectangle.
 * @property {number} width - The width of the rectangle.
 * @property {number} height - The height of the rectangle.
 */

export class CustomSvgElement {
    xmlns = "http://www.w3.org/2000/svg"
    maxWidth = 1000000000;
    constructor() {
        // Use a harmless temporary container element (e.g., <g>)
        this.svg = document.createElementNS(this.xmlns, "g");
    }

    /**
     * Draw the rectangle and text onto the SVG.
     * @param {SVGSVGElement} svgElement - The target SVG DOM element.
     * @returns {Bounds}
     */
    getPosition(svgElement) {
        const tmpWidth = svgElement.getAttribute("width");
        svgElement.setAttribute("width", this.maxWidth);
        const tmpHeight = svgElement.getAttribute("height");
        svgElement.setAttribute("height", this.maxWidth);
        let isTemporary = false;
        let tmpElem = this.svg;
        // If not currently in the DOM, temporarily add for measurement
        if (!tmpElem.ownerSVGElement) {
            tmpElem = this.svg.cloneNode(true);
            svgElement.appendChild(tmpElem);
            isTemporary = true;
        }
        const bbox = tmpElem.getBBox();
        // Remove if we temporarily added it
        if (isTemporary) {
            svgElement.removeChild(tmpElem);
        }

        svgElement.setAttribute("width", tmpWidth);
        svgElement.setAttribute("height", tmpHeight);
        return {
            left: bbox.x,
            right: bbox.x + bbox.width,
            top: bbox.y,
            bottom: bbox.y + bbox.height,
            middle: {
                x: bbox.x + Math.round(bbox.width / 2),
                y: bbox.y + Math.round(bbox.height / 2)
            },
            width: bbox.width,
            height: bbox.height,
        };
    }

    /**
     * Draw the ELEMENT onto the SVG.
     * @param {SVGSVGElement} svgElement - The target SVG DOM element.
     */
    draw(svgElement) {
        svgElement.appendChild(this.svg);
    }

    /**
     * Removes the ELEMENT from the SVG.
     * @param {SVGSVGElement} svgElement - The target SVG DOM element.
     */
    remove(svgElement) {
        svgElement.removeChild(this.svg);
    }
}

/**
 * @typedef {Object} SvgTextOptions
 * @property {number} x - The x-coordinate of the text.
 * @property {number} y - The y-coordinate of the text.
 * @property {string} text - The text to display.
 * @property {string} textColor - The color of the text.
 * @property {string} fontSize - The font size of the text.
 * @property {string} textAnchor - The horizontal alignment of the text ('left', 'center', 'right', etc.).
 * @property {string} dominantBaseline - The baseline alignment of the text ('top', 'middle', 'bottom', etc.).
 */

export class SvgText extends CustomSvgElement {
    /**
     * Create a new SvgText instance.
     * @param {SvgTextOptions} options - Configuration options for the text.
     */
    constructor(options) {
        super();
        this.options = options;
        const {
            x, y,
            text, textColor, fontSize, textAnchor, dominantBaseline,
        } = this.options;
        this.x = x;
        this.y = y;
        // Create text
        this.svg = document.createElementNS(this.xmlns, "text");
        if (text.trim() === "" && text !== "") {
            this.svg.innerHTML = "&nbsp;".repeat(text.length)
        } else {
            this.svg.textContent = text;
        }
        this.svg.setAttribute("x", x);
        this.svg.setAttribute("y", y);
        this.svg.setAttribute("text-anchor", textAnchor);
        this.svg.setAttribute("dominant-baseline", dominantBaseline);
        this.svg.setAttribute("fill", textColor);
        this.svg.setAttribute("font-size", fontSize);
    }
}

/**
 * @typedef {Object} BoundingBoxOptions
 * @property {string} fill - The fill color of the bounding box.
 * @property {string} stroke - The stroke color of the bounding box.
 * @property {number} strokeWidth - The stroke width of the bounding box.
 * @property {number} padding - The padding of the bounding box.
 * @property {number} minWidth - The minimal width of the bounding box.
 * @property {number} maxWidth - The maximal width of the bounding box.
 * @property {number} minHeight - The minimal height of the bounding box.
 * @property {number} maxHeight - The maximal height of the bounding box.
 */
export class SvgBoundingBox extends CustomSvgElement {
    /**
     * Create a new SvgRectWithText instance.
     * @param {CustomSvgElement} element - element that the bounding box will be created around.
     * @param {BoundingBoxOptions} options - Configuration options for the rectangle and text.
     * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
     */
    constructor(element, svgElement, options) {
        super();
        this.element = element;
        this.options = options;
        this.options.padding ??= 0;
        this.options.minWidth ??= 0;
        this.options.maxWidth ??= this.maxWidth;
        this.options.minHeight ??= 0;
        this.options.maxHeight ??= this.maxWidth;

        /**
         *
         * @param {number} num
         */
        function to0OrCeil(num) {
            if (-1 < num && num < 1) {
                return 0;
            } else {
                return Math.ceil(num)
            }
        }

        const pos = this.element.getPosition(svgElement);
        const rectWidth = Math.round(pos.width) + this.options.padding * 2;
        const rectHeight = Math.round(pos.height) + this.options.padding * 2;

        this.svg = document.createElementNS(this.xmlns, "g")

        const clippingId = getUniqueId();
        let elementId = 0;
        if (element.svg.hasAttribute("id")) {
            elementId = element.svg.getAttribute("id")
        } else {
            elementId = getUniqueId();
            element.svg.setAttribute("id", elementId);
        }

        // create clipping
        this.clippingContent = document.createElementNS(this.xmlns, "clipPath");
        this.clippingContent.setAttribute("id", clippingId);
        const rect = document.createElementNS(this.xmlns, "rect");
        rect.setAttribute("x", to0OrCeil(pos.left) - this.options.padding);
        rect.setAttribute("y", to0OrCeil(pos.top) - this.options.padding);
        rect.setAttribute("width", Math.min(Math.max(rectWidth, this.options.minWidth), this.options.maxWidth) - this.options.padding);
        rect.setAttribute("height", Math.min(Math.max(rectHeight, this.options.minHeight), this.options.maxHeight) - this.options.padding);
        this.clippingContent.appendChild(rect);

        // use clipping
        this.element.svg.setAttribute("clip-path", `url(#${clippingId})`);

        // visible rectangle
        this.displayRepresentation = document.createElementNS(this.xmlns, "rect");
        this.displayRepresentation.setAttribute("x", to0OrCeil(pos.left) - this.options.padding);
        this.displayRepresentation.setAttribute("y", to0OrCeil(pos.top) - this.options.padding);
        this.displayRepresentation.setAttribute("width", Math.min(Math.max(rectWidth, this.options.minWidth), this.options.maxWidth));
        this.displayRepresentation.setAttribute("height", Math.min(Math.max(rectHeight, this.options.minHeight), this.options.maxHeight));
        this.displayRepresentation.setAttribute("fill", this.options.fill);
        this.displayRepresentation.setAttribute("stroke", this.options.stroke);
        this.displayRepresentation.setAttribute("stroke-width", this.options.strokeWidth);

        this.svg.appendChild(this.clippingContent);
        this.svg.appendChild(this.displayRepresentation);
        this.svg.appendChild(this.element.svg);
    }
}

/**
 * @typedef {Object} ConnectorOptions
 * @property {string} stroke - The stroke color of the connector.
 * @property {number |  undefined} strokeWidth - The stroke width of the connector.
 */

export class SvgConnector extends CustomSvgElement {
    /**
     * Create a new SvgRectWithText instance.
     * @param {CustomSvgElement} from - element that the connector be from.
     * @param {CustomSvgElement} to - element that the connector be to.
     * @param {ConnectorOptions | undefined} options - Configuration options for the connector.
     * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
     */
    constructor(from, to, svgElement, options) {
        super();
        this.from = from;
        this.to = to
        this.options = options ?? {
            stroke: undefined,
            strokeWidth: undefined
        };
        this.options.stroke ??= "#888888";
        this.options.strokeWidth ??= 2;

        this.svg = document.createElementNS(this.xmlns, "path");
        this.svg.setAttribute("stroke", this.options.stroke);
        this.svg.setAttribute("stroke-width", this.options.strokeWidth);
        this.svg.setAttribute("fill", "none");

        /**
         *
         * @param {Bounds} positions
         */
        function getMiddle(positions) {
            return {
                "left": { "x": positions.left, "y": Math.round(positions.top + positions.height / 2) },
                "top": { "x": Math.round(positions.left + positions.width / 2), "y": positions.top },
                "right": { "x": positions.right, "y": Math.round(positions.top + positions.height / 2) },
                "bottom": { "x": Math.round(positions.left + positions.width / 2), "y": positions.bottom },
            }
        }

        const posElemFrom = this.from.getPosition(svgElement);
        const posElemTo = this.to.getPosition(svgElement);
        const middlesFrom = getMiddle(posElemFrom);
        const middlesTo = getMiddle(posElemTo);
        let trace = ""
        if ((middlesFrom.right.x < middlesTo.top.x) && (middlesFrom.right.y < middlesTo.top.y)) {
            // to element on right on bottom
            trace = `M ${middlesFrom.right.x} ${middlesFrom.right.y}
            L ${middlesTo.top.x} ${middlesFrom.right.y}
            L ${middlesTo.top.x} ${middlesTo.top.y}
            `
        } else if ((middlesFrom.right.x < middlesTo.bottom.x) && (middlesFrom.right.y > middlesTo.bottom.y)) {
            // to element on right on top
            trace = `M ${middlesFrom.right.x} ${middlesFrom.right.y}
            L ${middlesTo.bottom.x} ${middlesFrom.right.y}
            L ${middlesTo.bottom.x} ${middlesTo.bottom.y}
            `
        } else if ((middlesFrom.left.x > middlesTo.top.x) && (middlesFrom.left.y < middlesTo.top.y)) {
            // to element on left on bottom
            trace = `M ${middlesFrom.left.x} ${middlesFrom.left.y}
            L ${middlesTo.top.x} ${middlesFrom.left.y}
            L ${middlesTo.top.x} ${middlesTo.top.y}
            `
        } else if ((middlesFrom.left.x > middlesTo.bottom.x) && (middlesFrom.left.y > middlesTo.bottom.y)) {
            // to element on left on top
            trace = `M ${middlesFrom.left.x} ${middlesFrom.left.y}
            L ${middlesTo.bottom.x} ${middlesFrom.left.y}
            L ${middlesTo.bottom.x} ${middlesTo.bottom.y}
            `
        } else if (middlesFrom.top.x == middlesTo.top.x) {
            // both in the same row
            if (middlesFrom.bottom.y < middlesTo.top.y) {
                // to element on bottom
                trace = `M ${middlesFrom.bottom.x} ${middlesFrom.bottom.y}
                L ${middlesTo.top.x} ${middlesTo.top.y}
                `
            } else if (middlesFrom.top.y > middlesTo.top.y) {
                // to element on top
                trace = `M ${middlesFrom.top.x} ${middlesFrom.top.y}
                L ${middlesTo.bottom.x} ${middlesTo.bottom.y}
                `
            }
        } else if (middlesFrom.top.y == middlesTo.top.y) {
            // both in the same column
            if (middlesFrom.right.x < middlesTo.left.x) {
                // to element on right
                trace = `M ${middlesFrom.right.x} ${middlesFrom.right.y}
                L ${middlesTo.left.x} ${middlesTo.left.y}
                `
            } else if (middlesFrom.left.y > middlesTo.right.y) {
                // to element on left
                trace = `M ${middlesFrom.left.x} ${middlesFrom.left.y}
                L ${middlesTo.right.x} ${middlesTo.right.y}
                `
            }
        } else {
            console.warn("Unable to create connection, no space.")
        }

        this.svg.setAttribute("d", trace);
    }
}

export class ResizableSvg extends CustomSvgElement {
    /**
     * Create a new SvgRectWithText instance.
     * @param {CustomSvgElement[]} childElements - element that the bounding box will be created around.
     */
    constructor(childElements) {
        super();
        this.childElements = childElements;
        /** @type {SVGGElement} */
        this.svg = document.createElementNS(this.xmlns, "g");
        /** @type {SVGSVGElement} */
        this.elem = document.createElementNS(this.xmlns, "svg");
        this.elem.appendChild(this.svg);
        for (const elem of childElements) {
            this.svg.appendChild(elem.svg);
        }
        this.resize();
    }
    resize() {
        const pos = this.svg.getBoundingClientRect();
        this.elem.setAttribute("width", Math.ceil(pos.right));
        this.elem.setAttribute("height", Math.ceil(pos.bottom));
        const posFixed = this.svg.getBBox();
        this.elem.setAttribute("width", Math.ceil(posFixed.width + posFixed.x + 1));
        this.elem.setAttribute("height", Math.ceil(posFixed.height + posFixed.y + 1));
    }
    /**
     * Create a new SvgRectWithText instance.
     * @param {CustomSvgElement} childElement - element that the bounding box will be created around.
     */
    appendChild(childElement) {
        this.childElements.push(childElement);
        childElement.draw(this.svg);
        this.resize();
    }
}
