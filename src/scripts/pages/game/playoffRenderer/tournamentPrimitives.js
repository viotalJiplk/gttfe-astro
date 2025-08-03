import { CustomSvgElement, SvgBoundingBox, SvgConnector, SvgText } from "./svgPrimitives.js";

/**
 * @typedef {import('./svgPrimitives.js').BoundingBoxOptions} BoundingBoxOptions
 * @typedef {import('./svgPrimitives.js').SvgTextOptions} SvgTextOptions
 * @typedef {import('./svgPrimitives.js').ConnectorOptions} ConnectorOptions
 * */

/**
 * @typedef {Object} SvgMatchOptions
 * @property {number | undefined} minWidthTeams
 * @property {number | undefined} minWidthScore
 * @property {BoundingBoxOptions} bBoxOptions
 * @property {SvgTextOptions} textOptions
 */


export class SvgMatch extends CustomSvgElement {
    /**
     * Create a new match.
     * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
     * @param {number} x
     * @param {number} y
     * @param {string | undefined} team1
     * @param {string | undefined} team2
     * @param {SvgMatchOptions | undefined} options
     */
    constructor(svgElement, x, y, team1, team2, score1, score2, options = undefined) {
        super();
        this.x = x;
        this.y = y;
        this.svg = document.createElementNS(this.xmlns, "g");
        this.svg.classList.add("match");
        this.options = options ?? {
            minWidthTeams: 0,
            minWidthScore: 0,
            bBoxOptions: undefined,
            textOptions: undefined,
        }
        this.options.minWidthTeams ??= 0;
        this.options.minWidthScore ??= 0;

        this.options.bBoxOptions ??= {};
        this.options.bBoxOptions.stroke ??= "white";
        this.options.bBoxOptions.strokeWidth ??= 1;
        this.options.bBoxOptions.padding ??= 2;
        this.options.bBoxOptions.minWidth ??= 0;
        this.options.bBoxOptions.maxWidth ??= this.maxWidth;

        this.options.textOptions ??= {};
        this.options.textOptions.textColor ??= "white";
        this.options.textOptions.fontSize ??= "20px";
        this.options.textOptions.textAnchor ??= "start";
        this.options.textOptions.dominantBaseline ??= "hanging";

        /**
         *
         * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
         * @param {string} teamName
         * @param {number} x
         * @param {number} y
         * @param {number} minWidth
         * @param {number} maxWidth
         * @param {BoundingBoxOptions} bBoxOptions
         * @param {SvgTextOptions} textOptions
         */
        function createTeamHolder(svgElement, teamName, localX, localY, minWidth, maxWidth, bBoxOptions, textOptions) {
            textOptions.x = 0;
            textOptions.y = 0;
            textOptions.text = String(teamName);
            const textToMeasure = new SvgText(textOptions);
            const pos = textToMeasure.getPosition(svgElement);

            textOptions.x = localX - pos.left + bBoxOptions.padding + bBoxOptions.strokeWidth;
            textOptions.y = localY - pos.top + bBoxOptions.padding + bBoxOptions.strokeWidth;

            const text = new SvgText(textOptions);

            bBoxOptions.minWidth = minWidth;
            bBoxOptions.maxWidth = maxWidth;
            const box = new SvgBoundingBox(text, svgElement, bBoxOptions);
            return box;
        }

        let team1Element = createTeamHolder(svgElement, team1 ?? "      ", x, y, 0, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        let team2Element = createTeamHolder(svgElement, team2 ?? "      ", x, y, 0, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        const team1position = team1Element.getPosition(svgElement);
        const team2position = team2Element.getPosition(svgElement);
        this.options.minWidthTeams = Math.max(team1position.width, team2position.width, this.options.minWidthTeams);
        team1Element = createTeamHolder(svgElement, team1 ?? "      ", x, y, this.options.minWidthTeams, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        team2Element = createTeamHolder(svgElement, team2 ?? "      ", x, y + team1position.height, this.options.minWidthTeams, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);

        let score1Element = createTeamHolder(svgElement, score1 ?? " ", x, y, 0, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        let score2Element = createTeamHolder(svgElement, score2 ?? " ", x, y, 0, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        const score1position = score1Element.getPosition(svgElement);
        const score2position = score2Element.getPosition(svgElement);
        this.options.minWidthScore = Math.max(score1position.width, score2position.width, this.options.minWidthScore);
        score1Element = createTeamHolder(svgElement, score1 ?? " ", x + this.options.minWidthTeams, y, this.options.minWidthScore, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);
        score2Element = createTeamHolder(svgElement, score2 ?? " ", x + this.options.minWidthTeams, y + team1position.height, this.options.minWidthScore, this.maxWidth, this.options.bBoxOptions, this.options.textOptions);

        this.svg.appendChild(team1Element.svg)
        this.svg.appendChild(team2Element.svg)
        this.svg.appendChild(score1Element.svg)
        this.svg.appendChild(score2Element.svg)
    }
}

/**
 * @typedef {Object} MatchObject
 * @property {string | undefined} team1 - Name of the first team. (undefined = unknown)
 * @property {number | undefined} score1 - Score of the first team. (undefined = unknown)
 * @property {string | undefined | null} team2 - Name of the second team. (undefined = unknown, null = no team)
 * @property {number | undefined} score2 - Score of the second team. (undefined = unknown)
 */

/**
 * @typedef {Object} SvgStageOptions
 * @property {SvgMatchOptions | undefined} svgMatchOptions
 * @property {Stage|undefined} previousStage
 * @property {ConnectorOptions|undefined} connectorOptions
 */

export class SvgStage extends CustomSvgElement {
    /**
     * Create a new stage.
     * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
     * @param {number} x
     * @param {number} y
     * @param {MatchObject[]} matches
     * @param {SvgStageOptions | undefined} options
     */
    constructor(svgElement, x, y, matches, options = undefined) {
        super();
        this.y = y;
        this.x = x;
        this.svg = document.createElementNS(this.xmlns, "g");
        this.svg.classList.add("stage");
        /** @type {SvgStageOptions} */
        this.options = options ?? {
            svgMatchOptions: {},
            previousStage: undefined
        }

        this.options.svgMatchOptions ??= {};
        this.options.svgMatchOptions.minWidthTeams = 0;
        this.options.svgMatchOptions.minWidthScore = 0;

        this.itemHeight = 0;
        for (const match of matches) {
            const team2 = match.team2 === null ? "No team" : match.team2;
            const matchElement = new SvgMatch(svgElement, x, y, match.team1, team2, match.score1, match.score2, this.options.svgMatchOptions);
            if (matchElement.minWidthTeams > this.options.svgMatchOptions.minWidthTeams) {
                this.options.svgMatchOptions.minWidthTeams = matchElement.minWidthTeams;
            }
            if (matchElement.minWidthScore > this.options.svgMatchOptions.minWidthScore) {
                this.options.svgMatchOptions.minWidthScore = matchElement.minWidthScore;
            }

            const matchElementPos = matchElement.getPosition(svgElement);
            if (matchElementPos.height > this.itemHeight) {
                this.itemHeight = matchElementPos.height;
            }
        }
        let tmpY = y;

        /** @type {number[]} */
        this.placementY = [];
        /** @type {CustomSvgElement[]} */
        this.children = [];

        if (this.options.previousStage == undefined) {
            for (const match of matches) {
                const team2 = match.team2 === null ? "No team" : match.team2;
                this.placementY.push(tmpY);
                const matchElement = new SvgMatch(svgElement, x, tmpY, match.team1, team2, match.score1, match.score2, this.options.svgMatchOptions);
                this.svg.appendChild(matchElement.svg);
                tmpY += Math.round(3 / 2 * this.itemHeight);
                this.children.push(matchElement);
            }
        } else {
            let prevI = 0;
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i]
                /** @type {undefined | CustomSvgElement} */
                let connectionA = undefined;
                /** @type {undefined | CustomSvgElement} */
                let connectionB = undefined;
                if ((match.team2 == undefined) && ((prevI + 1) >= this.options.previousStage.placementY.length)) {
                    tmpY = this.options.previousStage.placementY[prevI];
                    connectionA = this.options.previousStage.children[prevI];
                    prevI += 1;
                } else if (prevI + 1 < this.options.previousStage.placementY.length) {
                    tmpY = this.options.previousStage.placementY[prevI] + Math.round((this.options.previousStage.placementY[prevI + 1] - this.options.previousStage.placementY[prevI] + this.options.previousStage.itemHeight) / 2) - Math.round(this.itemHeight / 2);
                    connectionA = this.options.previousStage.children[prevI];
                    connectionB = this.options.previousStage.children[prevI + 1];
                    prevI += 2;
                } else if (prevI < this.options.previousStage.placementY.length) {
                    tmpY = this.options.previousStage.placementY[prevI] + Math.round(3 / 2 * this.itemHeight);
                    connectionA = this.options.previousStage.children[prevI];
                    prevI += 2;
                } else if ((prevI - 1) < this.options.previousStage.placementY.length) {
                    tmpY = this.options.previousStage.placementY[prevI - 1] + Math.round(3 / 2 * this.itemHeight);
                    prevI += 1;
                } else {
                    tmpY += Math.round(3 / 2 * this.itemHeight);
                }
                this.placementY.push(tmpY);
                const team2 = match.team2 === null ? "No team" : match.team2;
                let matchElement = new SvgMatch(svgElement, x, tmpY, match.team1, team2, match.score1, match.score2, this.options.svgMatchOptions);
                if (connectionA !== undefined) {
                    const connector = new SvgConnector(connectionA, matchElement, svgElement, this.options.connectorOptions)
                    this.svg.appendChild(connector.svg);
                }
                if (connectionB !== undefined) {
                    const connector = new SvgConnector(connectionB, matchElement, svgElement, this.options.connectorOptions)
                    this.svg.appendChild(connector.svg);
                }
                this.children.push(matchElement);
                this.svg.appendChild(matchElement.svg);
            }
        }
    }
}

/**
 * @typedef {Object} SvgEventOptions
 * @property {SvgStageOptions | undefined} svgStageOptions
 */

export class SvgEvent extends CustomSvgElement {
    /**
     * Create a new event.
     * @param {SVGSVGElement} svgElement - Any SVG DOM element for calculations.
     * @param {number} x
     * @param {number} y
     * @param {MatchObject[][]} event
     * @param {SvgEventOptions | undefined} options
     */
    constructor(svgElement, x, y, event, options) {
        super();
        this.svg = document.createElementNS(this.xmlns, "g");
        this.svg.classList.add("Event");
        this.x = x;
        this.y = y;
        this.event = event;

        /** @type {SvgEventOptions} */
        this.options = options ?? {
            svgStageOptions: {}
        }

        this.options.svgStageOptions ??= {}

        let tmpX = x;
        for (const stageObj of event) {
            const stage = new SvgStage(svgElement, tmpX, y, stageObj, this.options.svgStageOptions);
            const pos = stage.getPosition(svgElement);

            tmpX += pos.width + 20;
            this.options.svgStageOptions.previousStage = stage;
            this.svg.appendChild(stage.svg);
        }
    }
}
