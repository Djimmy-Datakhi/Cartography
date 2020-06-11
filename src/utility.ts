export class util {
    /**
     * Permet de retouver l'index de la categories et values qui correspond a la forme actuel
     * Elle réalise un match entre le nom de la forme et le nom de la catégorie, lorsqu'il y a un match, il renvoie l'index
     * L'index retourné est égale à -1 si il n'y a pas de match
     * @param shapeName nom de la forme
     * @param categories liste de toute les catégorie
     */
    public static valueMatcher(shapeName:string,categories:string[]):number{
        for(var i = 0; i<categories.length; ++i){
            if(shapeName === categories[i]){
                return i;
            }
        }
        return -1;
    }

    /**
     * retire tous les charactères spéciaux et les espaces
     * @param str string a simplifier
     */
    public static simplifyString(str:string):string{
        return str.replace(/[^a-zA-Z ]|\s/g, "");
    }

    /**
     * retire tous les charactères spéciaux et les espaces
     * @param strs tableau de string a simplifier
     */
    public static simplifyStringArray(strs:string[]):string[]{
        var result:string[] = [];
        for(var str of strs){
            result.push(util.simplifyString(str));
        }
        return result;
    }
}
