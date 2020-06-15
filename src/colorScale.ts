import * as chroma from "chroma-js"

export class ColorScale {
    private scale: string[] = [];

    private range: number = 0;
    private startColor: string;
    private endColor: string;

    /**
     * Permet d'assigner la couleur de départ et d'arrivé pour l'échelle de couleur
     * @param start Couleur de départ, doit être sous forme hexadécimal
     * @param end Couleur d'arrivé, doit être sous forme hexadécimal
     */
    public setColor(start: string, end: string) {
        if (this.checkHexa(start, end)) {
            this.startColor = start;
            this.endColor = end;
        }
        else
            console.log("setColor : une couleur n'est pas correcte");
    }

    /**
     * Permet de définir le nombre de couleur différente pour composer l'échelle de couleur.
     * @param range le nombre de couleur différente sur l'échelle. Doit être supérieur ou égale à deux
     */
    public setRange(range: number) {
        if (range <= 1)
            console.log("setRange : le range doit être supérieur ou égale à deux");
        else
            this.range = range;
    }

    /**
     * Permet de générer l'échelle de couleur. Il faut que la couleur de départ, d'arrivé et le nombre de couleurs soient définis.
     * Pour définir les couleurs, utilise setColor.
     * Pour définir le nombre de couleurs, utilise setRange
     */
    public generateScale() {
        if (!this.startColor || !this.endColor) {
            console.log("generateScale : les couleurs de l'échelle ne sont pas définis");
            return;
        }
        if (!this.range) {
            console.log("generateScale : le range n'est pas définis");
            return;
        }
        this.scale = chroma.scale([this.startColor, this.endColor]).colors(this.range);
    }

    /**
     * Permet d'accéder a une couleur dans l'échelle de couleur via son index.
     * Est a utiliser en conjonction avec une scale d3.js (ex : getColor(quantile(value)) ).
     * @param value index de la couleur voulu. doit être positif, et inférieur au nombre de couleur
     */
    public getColor(value: number): string {
        if (value >= this.range || value < 0) {
            console.log("getColor : la valeur est incorrecte");
            return "#000000";
        }
        if (this.scale.length === 0) {
            this.generateScale();
        }
        return this.scale[value];
    }

    /**
     * Vérifie que les deux string passer en paramètre sont des nombres héxadécimaux.
     * @param str1 premier string
     * @param str2 deuxième string
     */
    private checkHexa(str1: string, str2: string): boolean {
        var regex: RegExp = /#[0-9A-Fa-f]{6}/g;
        var result: boolean = true;
        result = regex.test(str1) && result;
        regex.lastIndex = 0;
        result = regex.test(str2) && result;
        return result
    }
}