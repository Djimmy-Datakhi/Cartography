import powerbi from "powerbi-visuals-api";
import { max } from "d3";

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

    //TODO:documentation
    public static getDrillLevel(metadata: powerbi.DataViewMetadataColumn[]): number {
        var result: number = 0;
        for (var i = 0; i < metadata.length; ++i) {
            if (metadata[i].roles.category) {
                if (result < metadata[i].index)
                    result = metadata[i].index;
            }
        }
        if (result > 2)
            return 2;
        return result;
    }

    public static getMapName(drillLevel: number): string {
        if (drillLevel === 0)
            return 'regions';
        if (drillLevel === 1)
            return 'departements';
        if (drillLevel === 2)
            return 'arrondissements';
    }

    public static getMaxCoord(old: [number, number], cur: [number, number]): [number, number] {
        return [Math.max(old[0], cur[0]), Math.max(old[1], cur[1])];
    }

    public static getMinCoord(old: [number, number], cur: [number, number]): [number, number] {
        return [Math.min(old[0], cur[0]), Math.min(old[1], cur[1])];
    }

    public static getCentroid(max: [number, number], min: [number, number]): [number, number] {
        return [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2];
    }

    public static getZoomScale(max: [number, number], min: [number, number]): number {
        var x = (max[0] - min[0] + max[1] - min[1]);
        var scale = 18000 * Math.pow(x, -0.6);
        return scale === Infinity ? 80000 : scale;
    }
}
