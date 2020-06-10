export class util {
    /**
     * Permet de trouver la valeur d'une forme en fesant une correspondance entre le nom d'une forme, et la liste de toute les formes
     * Sachant que l'ordre des formes dans le fichier json et dans le dataview n'est pas le même
     * @param shapeName nom de la forme pour laquel on recherche la valeur
     * @param values lsite des valeurs de toute les formes
     * @param categories liste de toute les formes
     */
    public static valueMatcher(shapeName:string,values:number[],categories:string[]):number{
        var result:number=0;
        for(var index in categories){
            if(shapeName === categories[index]){
                result = values[index];
            }
        }
        return result
    }

    /**
     * retire tous les charactères spéciaux et les espaces
     * @param str string a simplifier
     */
    public static simplifyString(str:string):string{
        return str.replace(/[^a-zA-Z ]|\s/g, "");
    }

    /**
     * retire tous les cahractères spéciaux et les espaces
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
