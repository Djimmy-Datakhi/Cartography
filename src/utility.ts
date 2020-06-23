import powerbi from "powerbi-visuals-api";
import DataViewObjects = powerbi.DataViewObjects;
import { DataModel } from "./dataModel";


export class util {

    /**
     * Permet de tester si un string est un code (composer entiérement de numero)
     * @param value valeur a tester
     */
    public static isCode(value:string){
        return !isNaN(+value);
    }

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
        if (result > 3) //si l'index est trop grand (ne devrait pas arriver sur une hierarchie de 4 niveau) on le remet a 3
            return 3;
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
        if (drillLevel === 3)
            return 'communes';
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
     * permet d'avoir le vecteur de translation a appliquer pour placer la forme au centre de la div  en prennant en compte le zoom.
     * pour cela on calcul le vecteur entre le centre de la div et de la forme.
     * Ce vecteursera multiplier par le scale. Pour compensé le décentrage du scale,on ajoute (scale - 1)*c où c est le centre de la div.
     * @param dataModel model de donnée, nous permet de trouver le centre de la forme
     * @param path fonction de path, pour calculer le centre de la forme
     * @param x centre de la div
     * @param y centre de la div
     * @param scale facteur de zoom²
     */
    public static getTranslation(dataModel: DataModel, path, x: number, y: number, scale: number): [number, number] {
        var xtot = 0;
        var ytot = 0;
        var len = dataModel.data.length;
        for (var i = 0; i < len; ++i) {
            var center = path.centroid(dataModel.data[i].mapData);
            if(center[0] && center[1]){
                xtot = xtot + center[0];
                ytot = ytot + center[1];
            }
        }
        var translate: [number, number] = [x - (xtot / len), y - (ytot / len)]; // vecteur de translation entre le centroid de la forme et celle de la div
        translate = [(-(scale - 1) * x + translate[0] * scale), (-(scale - 1) * y + translate[1] * scale)]; //recentrage en prenant en compte le scale
        return translate;
    }

    /**
     * Permet de calculer le zoom, en fonction de la différence de taille entre la forme et la div.
     * Ne peut pas retourné un zoom inférieur à 1.
     * @param dataModel model de donnée, pour trouver la taille de la forme
     * @param path fonction de path, pour calculer la taille de la forme
     * @param width longueur de la div
     * @param height Largeur de la div
     */
    public static getZoomScale(dataModel: DataModel, path, width: number, height: number): number {
        var boundMax = [0, 0];
        var boundMin = [10000, 10000];
        var len = dataModel.data.length;
        for (var i = 0; i < len; ++i) {
            var bound = path.bounds(dataModel.data[i].mapData);
            boundMax[0] = Math.max(boundMax[0], bound[1][0]);
            boundMax[1] = Math.max(boundMax[1], bound[1][1]);
            boundMin[0] = Math.min(boundMin[0], bound[0][0]);
            boundMin[1] = Math.min(boundMin[1], bound[0][1]);
        }
        var shapeWidth = boundMax[0] - boundMin[0];
        var shapeHeight = boundMax[1] - boundMin[1];
        var scale = Math.min(width / shapeWidth, (height / shapeHeight) * 0.8); // on diminue unpeu le scale de la hauteur pour pas que ca dépasse
        return scale < 1 ? 1 : scale;
    }

    /**
     * Permet de récupérer une valeur d'objet (options) dans les métadonnées
     * @param objects metadata.objects
     * @param objectName nom de l'objet
     * @param propertyName nom de la propriété
     * @param defaultValue valeur par défault
     */
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
