import { isIterable } from "../utils";
import { ApiObject, ShowError } from "./utils"

export class Sponsor extends ApiObject{
    static types = {
        "logo": String,
        "sponsorId": Number,
        "sponsorLink": String,
        "sponsorName": String,
        "sponsorText": String
    }
    logo: string;
    sponsorId: number;
    sponsorLink: string;
    sponsorName: string;
    sponsorText: string;

    constructor(logo: string, sponsorId: number, sponsorLink: string, sponsorName: string, sponsorText: string) {
        super();
        this.logo = logo;
        this.sponsorId = sponsorId;
        this.sponsorLink = sponsorLink;
        this.sponsorName = sponsorName;
        this.sponsorText = sponsorText;
    }
}

export async function loadSponsors() {
    let res = await fetch("/backend/sponsor/all/");
    let sponsorsObj = await res.json();
    let sponsors: Sponsor[] = [];
    if (!isIterable(sponsorsObj)) {
        console.error(`/backend/sponsor/all/ responded with non iterable.`);
        throw new ShowError("Chyba serveru, kontaktujte prosím podporu.");
    }
    for (let sponsorObj of sponsorsObj) {
        //@ts-expect-error
        sponsors.push(Sponsor.fromObject(sponsorObj));
    }
    return sponsors;
}