import powerbi from "powerbi-visuals-api";
import ISelectionManager = powerbi.extensibility.ISelectionManager;
import ISelectionId = powerbi.extensibility.ISelectionId;

import * as d3 from "d3";
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

import {DataModel} from "./dataModel"
import { VisualSettings } from "./settings";
import { util } from "./utility";

export class Map {
    private div:Selection<SVGElement>;
    private path;
    private previousSelected: ISelectionId;

    constructor(svg:Selection<SVGElement>){
        this.div = svg.append('g');
    }

    public erase(){
        this.div.selectAll('.path').remove();
    }

    public draw(dataModel: DataModel,settings: VisualSettings,selectionManager: ISelectionManager,x:number,y:number){
        var _this = this;

        //supprimer le dessin précédent
        this.erase();

        //creation de la fonction de traçage
        var projection = d3.geoConicConformal()
        .center([2.454071, 46.279229]) //centre de la france
        .scale(2600) //zoom
        .translate([x, y]) //on place la carte au centre de la div

        this.path = d3.geoPath().projection(projection); //on initialise la fonction de traçage avec la prise en compte de la projection        
        
        //dessin
        this.div //on dessine les formes une par une
            .selectAll('path')
            .data(dataModel.data)
            .enter()
            .append('path')
            .attr('class', 'path')
            .attr('d', function (d) { return _this.path(d.mapData) }) //dessin de la forme
            .attr('id', function (d) { return d.name }) //nom de la forme
            .attr('fill', function (d) { return d.color }) //couleur
            .style('opacity', function(d) {
                if(selectionManager.hasSelection()){
                    console.log(_this.previousSelected);
                    console.log(d.selectionId);

                    if(JSON.stringify(_this.previousSelected) === JSON.stringify(d.selectionId)){ //update créer une nouvelle instance de selectionId, il faut donc trouve un autre moyen de tester l'égalité. 
                        return "1";
                    }
                    else{
                        return "0.5";
                    }
                }
                else{
                    if(d.highlight != null){
                        if(d.highlight === 0){
                            return "0.5";
                        }
                        return "1";
                    }
                    return "1";    
                }
            })
            .on('click', function (d) { //gestion du clic droit
                if(selectionManager.hasSelection() && _this.previousSelected === d.selectionId){
                    _this.previousSelected = null
                    d3.selectAll('path').style('opacity',1)
                    selectionManager.clear();
                }
                else{
                    _this.previousSelected = d.selectionId;
                    d3.selectAll('path').style('opacity',0.5)
                    d3.select(this).style('opacity',1);
                    selectionManager.select(d.selectionId);
                }
                
            })
            .on('contextmenu', function (d) { //gestion du clic gauche
                const mouseEvent: MouseEvent = d3.event as MouseEvent;
                selectionManager.showContextMenu(d.selectionId, {
                    x: mouseEvent.clientX,
                    y: mouseEvent.clientY
                });
                mouseEvent.preventDefault();
            });

        //animation
        var scale = util.getZoomScale(dataModel,this.path,x,y*2); //on considère la hauteur entière car on veut que la forme prenne toute la hauteur de la div
        var translate = util.getTranslation(dataModel,this.path,x,y,scale);
        
        this.div
        .transition().duration(750)
        .attr("transform","translate("+translate[0]+","+translate[1]+")scale("+scale+")")
        
       // .transition().duration(750).attr("transform","scale("+scale+")");

    }
}