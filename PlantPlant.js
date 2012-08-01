$(function() {
    start();
});

// global variable
var plantPlant = {
    plantList: new Array(),
    ctx: null,
    maxTreeSize: 20,
    mouseX: 0,
    mouseY: 0,
    boundingRect:{left:0, right:0, top:0, bottom:0, height:0, width:0},
    color_back: 'rgb(245, 255, 255)',
    color_stem: 'rgba(100, 50, 0, 0.7)',
    color_branch: 'rgba(160, 150, 0, 0.6)',
    color_leaf: 'rgba(60, 170, 30, 0.5)',
    color_point: 'rgba(0, 0, 0, 0.9)',
    color_root_fill: 'rgba(180, 180, 180, 0.8)',
    mouseState: {press: false, drag: false, tree: undefined}
};

function start() {
    /* canvas要素のノードオブジェクト */
    var canvas = document.getElementById('canvas');
    /* canvas要素の存在チェックとCanvas未対応ブラウザの対処 */
    if ( ! canvas || ! canvas.getContext ) {
        return false;
    }

    // mouse events
    canvas.onclick = function(e)
    {
        if( plantPlant.mouseState.drag )
        {
            plantPlant.mouseState.drag = false;
            return;
        }
        plantPlant.mouseX = e.clientX - plantPlant.boundingRect.left;
        plantPlant.mouseY = e.clientY - plantPlant.boundingRect.top;
        for( var i = 0; i < plantPlant.plantList.length; i++ )
        {
            if( distPlant(plantPlant.plantList[i], plantPlant.mouseX, plantPlant.mouseY) < 10 )
            {
                if( plantPlant.plantList[i].fix )
                {
                    plantPlant.plantList[i].fix = false;
                } else {
                    plantPlant.plantList[i].fix = true;
                }
                break;
            }
        }
        plantPlant.mouseState.drag = false;
    };
    canvas.ondblclick = function(e)
    {
        if( plantPlant.mouseState.drag )
        {
            plantPlant.mouseState.press = false;
            plantPlant.mouseState.drag = false;
            return;
        }
        
        plantPlant.mouseX = e.clientX - plantPlant.boundingRect.left;
        plantPlant.mouseY = e.clientY - plantPlant.boundingRect.top;
        for( var i = 0; i < plantPlant.plantList.length; i++ )
        {
            if( distPlant(plantPlant.plantList[i], plantPlant.mouseX, plantPlant.mouseY) < 10 )
            {
                plantPlant.plantList.splice(i, 1);
                break;
            }
        }
        plantPlant.mouseState.press = false;
        plantPlant.mouseState.drag = false;
    };
    canvas.onmousemove = function(e)
    {
        plantPlant.mouseX = e.clientX - plantPlant.boundingRect.left;
        plantPlant.mouseY = e.clientY - plantPlant.boundingRect.top;

        if( plantPlant.mouseState.drag && plantPlant.mouseState.tree ) {
            plantPlant.mouseState.tree.posX = plantPlant.mouseX;
            plantPlant.mouseState.tree.posY = plantPlant.mouseY;
        }
        if( plantPlant.mouseState.press )
        {
            plantPlant.mouseState.drag = true;    
        }
    };
    canvas.onmousedown = function(e)
    {
        plantPlant.mouseX = e.clientX - plantPlant.boundingRect.left;
        plantPlant.mouseY = e.clientY - plantPlant.boundingRect.top;
        for( var i = 0; i < plantPlant.plantList.length; i++ )
        {
            if( distPlant(plantPlant.plantList[i], plantPlant.mouseX, plantPlant.mouseY) < 10 )
            {
                plantPlant.mouseState.tree = plantPlant.plantList[i];
                break;
            }
        }
        plantPlant.mouseState.press = true;
    };
    canvas.onmouseup = function(e)
    {
        plantPlant.mouseState.press = false;
    };
    
    /* 2Dコンテキスト */
    plantPlant.ctx = canvas.getContext('2d');

    // 木のリストを生成する
    plantPlant.plantList = new Array();
    
    plantPlant.boundingRect = canvas.getBoundingClientRect();
    //console.log(plantPlant.boundingRect);
    
    var tid = setInterval(plantStep, 150);
    
    var gene = new PlantGene("S");
    gene.addRule({symbol: "S", children: [{symbol: "S", angle: 30 * Math.PI / 180, scale:0.8}, {symbol: "S", angle: -30 * Math.PI / 180, scale:0.8}], probability: 0.25});
    gene.addRule({symbol: "S", children: [{symbol: "S", angle: 20 * Math.PI / 180, scale:0.7}, {symbol: "S", angle: 0 * Math.PI / 180, scale:0.9}, {symbol: "S", angle: -20 * Math.PI / 180, scale:0.7}], probability: 0.25});
    gene.addRule({symbol: "S", children: [{symbol: "E", angle: 35 * Math.PI / 180, scale:0.7}, {symbol: "S", angle: 0 * Math.PI / 180, scale:0.8}, {symbol: "E", angle: -35 * Math.PI / 180, scale:0.7}], probability: 0.2});
    gene.addRule({symbol: "S", children: [{symbol: "e", angle: 10 * Math.PI / 180, scale:0.75}, {symbol: "e", angle: 10 * Math.PI / 180, scale:0.75}], probability: 0.2});
    gene.addRule({symbol: "S", children: [{symbol: "E", angle: -10 * Math.PI / 180, scale:0.6}, {symbol: "s", angle: -45 * Math.PI / 180, scale:0.7}], probability: 0.1});
    gene.addRule({symbol: "E", children: [{symbol: "E", angle: 20 * Math.PI / 180, scale:0.7}, {symbol: "E", angle: -20 * Math.PI / 180, scale:0.7}], probability: 0.4});
    gene.addRule({symbol: "E", children: [{symbol: "S", angle: 10 * Math.PI / 180, scale:0.8}, {symbol: "e", angle: -10 * Math.PI / 180, scale:0.7}], probability: 0.3});
    gene.addRule({symbol: "E", children: [{symbol: "e", angle: 20 * Math.PI / 180, scale:0.75}, {symbol: "e", angle: -20 * Math.PI / 180, scale:0.75}], probability: 0.3});
    plantPlant.gene = gene;
    
    return true;
};

function plantStep()
{
    // clear canvas
    plantPlant.ctx.fillStyle = plantPlant.color_back;
    plantPlant.ctx.fillRect(0, 0, plantPlant.boundingRect.width, plantPlant.boundingRect.height);

    // draw plants
    for( var i = 0; i < plantPlant.plantList.length; i++ )
    {
        var plant = plantPlant.plantList[i];
        plant.draw(plantPlant.ctx);
        plant.grow();
        if( plant.isAdult() && !plant.fix )
        {
            plantPlant.plantList.splice(i, 1);
            i = i -1;
        }
    }
    // generate a new plant randomly
    if( (plantPlant.plantList.length == 0 || Math.random() < 0.05) && plantPlant.plantList.length < plantPlant.maxTreeSize )
    //if( plantPlant.plantList.length == 0 )
    {
        var plant;
        if( Math.random() > 0.5 )
        {
            var angle1 = 10 + Math.random() * 60;
            var angle2 = -10 -Math.random() * 60;
            var length1 = 10 + Math.random() * 80;
            var length2 = 10 + Math.random() * 80;
            var scale1 = 0.2 + Math.random() * 0.7;
            var scale2 = 0.2 + Math.random() * 0.7;
            plant = new Plant(Math.random() * plantPlant.boundingRect.width,
                              1 * plantPlant.boundingRect.height / 3.0 + Math.random() * 2 * plantPlant.boundingRect.height / 3.0,
                              20,
                              new Array({'angle': angle1 * Math.PI / 180, 'length':length1, 'scale':scale1},
                                        {'angle': angle2 * Math.PI / 180, 'length':length2, 'scale':scale2}));
        }
        else
        {
            var angle1 = Math.random() * 80;
            var angle2 = -20 + Math.random() * 60;
            var angle3 = -Math.random() * 80;
            var length1 = 10 + Math.random() * 80;
            var length2 = 10 + Math.random() * 80;
            var length3 = 10 + Math.random() * 80;
            var scale1 = 0.2 + Math.random() * 0.65;
            var scale2 = 0.2 + Math.random() * 0.7;
            var scale3 = 0.2 + Math.random() * 0.65;
            plant = new Plant(Math.random() * plantPlant.boundingRect.width,
                              1 * plantPlant.boundingRect.height / 3.0 + Math.random() * 2 * plantPlant.boundingRect.height / 3.0,
                              20,
                              new Array({'angle': angle1 * Math.PI / 180, 'length':length1, 'scale':scale1},
                                        {'angle': angle2 * Math.PI / 180, 'length':length2, 'scale':scale2},
                                        {'angle': angle3 * Math.PI / 180, 'length':length3, 'scale':scale3}));
        }
        /*
        plant = new Plant(Math.random() * plantPlant.boundingRect.width,
                          1 * plantPlant.boundingRect.height / 2.0 + Math.random() * plantPlant.boundingRect.height / 2.0,
                          Math.random() * 60);
        plant.gene = plantPlant.gene;
        plant.randomGenerate();
        */
        
        plantPlant.plantList.push(plant);
    }
}


// --- utility functions ---
function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2));
}

function distPlant(plant, x, y) {
    return Math.sqrt((plant.posX - x) * (plant.posX - x) + (plant.posY - y) * (plant.posY - y));
}

function drawLine(x1, y1, x2, y2, color, ctx) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCircle(x, y, radius, color, ctx) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.stroke();
}
