/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import Fill = powerbi.Fill;
import { ColorScale } from "./colorScale";
import { util } from "./utility";


class MapBackgroundSetting {
  public selectedMap: string;
  public drillLevel: number;

  constructor() {
    this.selectedMap = "regions";
    this.drillLevel = 0;
  }
}

class ScaleSetting {
  public rangeLevel: number;
  public colors: ColorScale ;

  constructor() {
    this.rangeLevel = 6;
    this.colors = new ColorScale;
  }
}

class ColorSetting{
  public minColor:Fill;
  public maxColor:Fill;

  constructor() {
    this.minColor = {solid:{color:"#FFFF00"}};
    this.maxColor = {solid:{color:"#FF0000"}};
  }
}

export class VisualSettings {
  public mapBackground: MapBackgroundSetting;
  public color: ColorSetting;
  public scale: ScaleSetting;

  constructor() {
    this.mapBackground= new MapBackgroundSetting;
    this.color = new ColorSetting;
    this.scale= new ScaleSetting;
  }

  public parse(dataview: DataView){
    //var setting: VisualSettings = new VisualSettings;

    var metadata = dataview.metadata;
    //map background setting
    this.mapBackground.drillLevel = util.getDrillLevel(metadata.columns); //donne a quel niveau de drilldown on se trouve (commence a 0)
    this.mapBackground.selectedMap = util.getMapName(this.mapBackground.drillLevel); //donne la carte a utiliser en fonction du niveau de drilldown

    //color setting
    this.color.minColor = util.getValue(dataview.metadata.objects,"couleur","minColor",{solid:{color:"#FFFF00"}});
    this.color.maxColor = util.getValue(dataview.metadata.objects,"couleur","maxColor",{solid:{color:"#FF0000"}});

    //color scale setting
    console.log(this.color.minColor.solid.color);
    this.scale.rangeLevel = 6; //donne le nombre de "catégorie" de couleur pour l'échelle
    this.scale.colors.setColor(this.color.minColor.solid.color, this.color.maxColor.solid.color); //permet de créer l'échelle de couleur a partir d'une couleur de départ et une couleur d'arrivé
    this.scale.colors.setRange(6); //donne a l'échelle de couleur le nombre de catégorie de couleur 
    this.scale.colors.generateScale(); //on génère l'échelle de couleur
  }
}


