import powerbi from "powerbi-visuals-api";
import DataViewObjects = powerbi.DataViewObjects;


export class util {
    /**
     * Permet de retouver l'index de la categories et values qui correspond a la forme actuel
     * Elle réalise un match entre le nom de la forme et le nom de la catégorie, lorsqu'il y a un match, il renvoie l'index
     * L'index retourné est égale à -1 si il n'y a pas de match
     * @param shapeName nom de la forme
     * @param categories liste de toute les catégorie
     */
    public static valueMatcher(shapeName: string, categories: string[]): number {
        for (var i = 0; i < categories.length; ++i) {
            if (shapeName === categories[i]) {
                return i;
            }
        }
        return -1;
    }

    /**
     * retire tous les charactères spéciaux et les espaces
     * @param str string a simplifier
     */
    public static simplifyString(str: string): string {
        return str.replace(/[^a-zA-Z ]|\s/g, "");
    }

    /**
     * retire tous les charactères spéciaux et les espaces
     * @param strs tableau de string a simplifier
     */
    public static simplifyStringArray(strs: string[]): string[] {
        var result: string[] = [];
        for (var str of strs) {
            result.push(util.simplifyString(str));
        }
        return result;
    }

    /**
     * Permet d'avoir le niveau de drilldown grâce aux métadonnées
     * @param metadata metadonnée des colonnes (dataview.metadata.columns)
     */
    public static getDrillLevel(metadata: powerbi.DataViewMetadataColumn[]): number {
        var result: number = 0;
        for (var i = 0; i < metadata.length; ++i) { // parcour les métadonnées de toute les colonnes
            if (metadata[i].roles.category) { //regarde si la colonnes est bien une category (et pas une value ou measure)
                if (result < metadata[i].index) //prend l'index le plus haut
                    result = metadata[i].index;
            }
        }
        if (result > 2) //si l'index est trop grand (ne devrait pas arriver sur une hierarchie de 3 niveau) on le remet a 2
            return 2;
        return result;
    }

    /**
     * Donne le nom de la carte qui correspond au niveau de drilldown
     * pour avoir la carte en elle même, utiliser geoJsonProvider
     * @param drillLevel Niveau de drilldown (donnée par util.getDrillLevel)
     */
    public static getMapName(drillLevel: number): string {
        if (drillLevel === 0)
            return 'regions';
        if (drillLevel === 1)
            return 'departements';
        if (drillLevel === 2)
            return 'arrondissements';
    }

    /**
     * Permet de recherche la coordonnée maximal (la plus en haut à droite).
     * utile pour trouver des bordures.
     * @param old ancienne coordonnée
     * @param cur nouvelle coordonnée
     */
    public static getMaxCoord(old: [number, number], cur: [number, number]): [number, number] {
        return [Math.max(old[0], cur[0]), Math.max(old[1], cur[1])];
    }

    /**
     * Permet de recherche la coordonnée minimal (la plus en bas à gauche).
     * utile pour trouver des bordures.
     * @param old ancienne coordonnée
     * @param cur nouvelle coordonnée
     */
    public static getMinCoord(old: [number, number], cur: [number, number]): [number, number] {
        return [Math.min(old[0], cur[0]), Math.min(old[1], cur[1])];
    }

    /**
     * permet d'avoir le centre geographique d'une zone (carré) grace aux bordures
     * @param max bordure maximal (la plus en haut à droite)
     * @param min bordure minimal (la plus en bas à gauche)
     */
    public static getCentroid(max: [number, number], min: [number, number]): [number, number] {
        return [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2];
    }

    /**
     * Permet d'avoir le zoom approprié, la valeur est a utiliser lorsque l'on définie la projection, dans le .scale(value).
     * la fonction a été définie par régression manuellement, c'est de la magie cherche pas.
     * /!\ peut faire n'importe quoi pour les formes trop grandes ou trop petite, le minimum est de la taille de paris, le maximum celle de la france (+ corse)
     * @param max bordure maximal (la plus en haut à droite)
     * @param min bordure minimal (la plus en bas à gauche)
     */
    public static getZoomScale(max: [number, number], min: [number, number]): number {
        var x = (max[0] - min[0] + max[1] - min[1]);
        var scale = 18000 * Math.pow(x, -0.6);
        return scale === Infinity ? 80000 : scale;
    }

    //TODO: docu
    public static getValue<T>(objects: DataViewObjects, objectName: string, propertyName: string, defaultValue: T): T {
        if (objects) {
            let object = objects[objectName];
            if (object) {
                let property: T = <T>object[propertyName];
                if (property !== undefined) {
                    return property;
                }
            }
        }
        return defaultValue;
    }
}
