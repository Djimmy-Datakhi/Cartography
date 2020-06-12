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
import { ColorScale } from "./colorScale";
import { util } from "./utility";

class MapBackgroundSetting {
  public selectedMap: string = "regions";
  public drillLevel: number = 0;
}

class ScaleSetting {
  public rangeLevel: number = 6;
  public colors: ColorScale = new ColorScale;
}

export class VisualSettings {
  public mapBackground: MapBackgroundSetting = new MapBackgroundSetting;
  public scale: ScaleSetting = new ScaleSetting;


  public static parse(dataview: DataView): VisualSettings {
    var setting: VisualSettings = new VisualSettings;

    var metadata = dataview.metadata.columns;
    //map background setting
    setting.mapBackground.drillLevel = util.getDrillLevel(dataview.metadata.columns); //donne a quel niveau de drilldown on se trouve (commence a 0)
    setting.mapBackground.selectedMap = util.getMapName(setting.mapBackground.drillLevel); //donne la carte a utiliser en fonction du niveau de drilldown

    //color scale setting
    setting.scale.rangeLevel = 6; //donne le nombre de "catégorie" de couleur pour l'échelle
    setting.scale.colors.setColor('#FFFF00', '#FF0000'); //permet de créer l'échelle de couleur a partir d'une couleur de départ et une couleur d'arrivé
    setting.scale.colors.setRange(6); //donne a l'échelle de couleur le nombre de catégorie de couleur 

    return setting;
  }
}


