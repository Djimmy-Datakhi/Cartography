import * as chroma from "chroma-js"

export class ColorScale{
    private scale:string[] = [];
    private regex:RegExp = /#[0-9A-Fa-f]{6}/g;

    private range:number = 0;
    private startColor: string;
    private endColor: string;

    
    public setColor(start:string,end:string){
        if(this.checkRegEx(start,end)){
            this.startColor = start;
            this.endColor = end;
        }
        else
            console.log("setColor : une couleur n'est pas correcte");
    }

    public setRange(range:number){
        if(range <=1)
            console.log("setRange : le range doit être supérieur ou égale a deux");
        else
            this.range = range;
    }

    public generateScale(){
        if(!this.startColor || !this.endColor){
            console.log("generateScale : les couleurs de l'échelle ne sont pas définis");
            return;
        }
        if(!this.range){
            console.log("generateScale : le range n'est pas définis");
            return;
        }
        this.scale = chroma.scale([this.startColor,this.endColor]).colors(this.range);
    }

    public getColor(value:number):string{
        if(value >= this.range || value < 0){
            console.log("getColor : la valeur est incorrecte");
            return "#000000";
        }
        if(this.scale.length === 0){
            this.generateScale();
        }
        return this.scale[value];
    }

    private  checkRegEx(str1:string, str2:string):boolean{
        var result:boolean = true;
        result = this.regex.test(str1) && result;
        this.regex.lastIndex = 0;
        result = this.regex.test(str2) && result;
        return result
    }
}