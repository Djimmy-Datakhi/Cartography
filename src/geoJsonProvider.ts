import departements from "../assets/geoJson/departements.json";
import regions from "../assets/geoJson/regions.json";
import arrondissements from "../assets/geoJson/arrondissements.json";

/**
 * Permet de récupérer les fichiers geoJson.
 * Les valeurs possible sont departements, regions et arrondissements.
 * @param name nom de json a récupérer
 */
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
