import departements from "../assets/geoJson/departements.json";
import regions from "../assets/geoJson/regions.json";

export function getJson(name:string){
    var result;
    switch(name){
        case 'departements' :
            result = departements;
            break;
        case 'regions' :
            result = regions;
            break;
    }
    return result;
}
