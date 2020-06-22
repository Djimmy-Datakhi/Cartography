import departements from "../assets/geoJson/departements.json";
import regions from "../assets/geoJson/regions.json";
import arrondissements from "../assets/geoJson/arrondissements.json";
import communes from "../assets/geoJson/communes.json";

/**
 * Permet de récupérer les fichiers geoJson.
 * Les valeurs possible sont departements, regions et arrondissements.
 * @param name nom de json a récupérer
 */
export function getJson(name: string) {
    var result;
    switch (name) {
        case 'regions':
            result = regions;
            break;
        case 'departements':
            result = departements;
            break;
        case 'arrondissements':
            result = arrondissements;
            break;
        case 'communes':
            result = communes;
            break;
    }
    return result;
}
