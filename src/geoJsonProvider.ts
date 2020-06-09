import departements from "../assets/geoJson/departements.json";
import regions from "../assets/geoJson/regions.json";
import arrondissements from "../assets/geoJson/arrondissements.json";

export function getJson(name:string){
    var result;
    switch(name){
        case 'departements' :
            result = departements;
            break;
        case 'regions' :
            result = regions;
            break;
        case 'arrondissements' :
            result = arrondissements;
            break;
    }
    return result;
}
