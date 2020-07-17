export class LandingPage {
private page: HTMLElement

    constructor(){
        this.page = document.createElement("div");

        let header = document.createElement("h1");
        header.textContent = "France DrillDown";
        header.setAttribute("class", "LandingPage");

        let comDiv = document.createElement("div");
        comDiv.setAttribute("class","centerDiv");
        let text = document.createElement("span");
        text.setAttribute("class","boldCenter");
        text.innerText = "Powered By : ";
        let logo = document.createElement("div");
        logo.setAttribute("class","centerDiv");
        let img = document.createElement("img");
        img.setAttribute("src"," data:image/png;base64,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")
        img.setAttribute("class","center");
        let datakhi = document.createElement("span");
        datakhi.setAttribute("class","boldCenter datakhi");
        datakhi.innerText = "DATAKHI";
        comDiv.appendChild(text);
        logo.appendChild(img);
        logo.appendChild(datakhi)
        comDiv.appendChild(logo);
        

        let textDiv = document.createElement("div");
        let p = document.createElement("p");
        p.setAttribute("class","centerText");
        p.innerText = "Pour commencer a utiliser ce visuel, ajoutez vos données. Les données de localisation doit être la hiérarchie régions, départements, arrondissements, puis communes. <br>" +   
        "Vous pouvez identifier les territoires avec le code INSEE, ou avec le nom du territoire.<br>" +
        "Si vous n'avez pas la hierarchie complète, utiliser les fonction de formatage du visuel pour spécifier votre hierarchie";
        textDiv.appendChild(p);

        this.page.appendChild(header);
        this.page.appendChild(comDiv);
        this.page.appendChild(textDiv);

        this.page;
    }

    public getLandingPage():HTMLElement{
        return this.page
    }
}