function Plant(x, y, stemLength, branchList)
{
    // gene
    this.gene = new PlantGene();
    this.tree = null;
    
    // position and branches
    this.posX = x;
    this.posY = y;
    this.stemLength = stemLength;
    this.branchList = branchList;
    this.maxStep = 7;
    
    // current state of growth
    this.growthStep = 1;
    this.maxGrowthStep = 200;
    this.scale = 0.0;
}

Plant.prototype.addBranch = function(branch)
{
    this.branchList.push(branch);
};

Plant.prototype.grow = function(ctx)
{
    this.growthStep = Math.min(this.growthStep + 1, this.maxGrowthStep);
    this.scale = 1.0 / (Math.exp((-this.growthStep / this.maxGrowthStep + 0.5 - 0.2) / 0.1) + 1);
    //console.log("scale = " + this.scale);
};

Plant.prototype.isAdult = function(ctx)
{
    return this.growthStep >= this.maxGrowthStep;
};

Plant.prototype.draw = function(ctx)
{
    var youngRate = (this.growthStep / this.maxGrowthStep);
    var bias = 1 / (Math.exp((youngRate - 0.5 + 0.2) / 0.1) + 1);
    
    if( this.tree )
    {
        // draw the first stem
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.stemLength * this.scale);   
        ctx.stroke();

        // draw tree
        ctx.translate(this.posX, this.posY);
        ctx.rotate(Math.PI);
        this.drawTree(this.tree, 0, 0, Math.PI / 2, bias, ctx);
        //this.drawTree(this.tree, 0, this.stemLength * this.scale, Math.PI / 2, bias, ctx);
        ctx.rotate(-Math.PI);
        ctx.translate(-this.posX, -this.posY);

        // draw circle at root position
        ctx.beginPath();
        ctx.strokeStyle = plantPlant.color_point;
        ctx.arc(this.posX, this.posY, 5, 0, 2 * Math.PI, false);
        if( this.fix ) // change drawing style -> fill arc
        {
            console.log("fill");
            ctx.fill();
        } else {
            ctx.stroke();
        }
        
        return true;
    }
        
    ctx.translate(this.posX, this.posY);
    ctx.rotate(Math.PI);

    // draw the first stem
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, this.stemLength * this.scale);   
    ctx.stroke();

    // draw fractal tree
    this.draw_recursive(1, 0, this.stemLength * this.scale, Math.PI / 2, this.scale, bias, ctx);
    ctx.rotate(-Math.PI);
    ctx.translate(-this.posX, -this.posY);
 
    // draw circle at root position
    ctx.beginPath();
    ctx.strokeStyle = plantPlant.color_point;
    ctx.arc(this.posX, this.posY, 5, 0, 2 * Math.PI, false);
    ctx.stroke();
    if( this.fix ) // change drawing style -> fill arc
    {
        ctx.fillStyle = plantPlant.color_root_fill;
        ctx.fill();
    }
    
    return true;
};

Plant.prototype.drawTree = function(tree, x, y, angle, bias, ctx)
{
    var length = tree.length * this.scale;
    angle = (1 - bias) * angle + bias * (Math.PI);
    
    var toX = x + length * Math.cos(angle + tree.angle);
    var toY = y + length * Math.sin(angle + tree.angle);
    
    var mX = this.posX - plantPlant.mouseX;
    var mY = this.posY - plantPlant.mouseY;
    var dist = (toX - mX) * (toX - mX) + (toY - mY) * (toY - mY);
    dist += 1;
    toX = toX + 100 * (toX - mX) / (Math.sqrt(dist) * 20);
    toY = toY + 100 * (toY - mY) / (Math.sqrt(dist) * 20);
    
    // draw line
    if( length < 20 )
    {
        ctx.strokeStyle = plantPlant.color_leaf;
    }
    else if( length < 70 )
    {
        ctx.strokeStyle = plantPlant.color_branch;
    }
    else
    {
        ctx.strokeStyle = plantPlant.color_stem;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(toX, toY);
    ctx.closePath();
    ctx.stroke();

    if( tree.children )
    {
        for( var i = 0; i < tree.children.length; i++ )
        {
            // draw child leaves
            var branch = tree.children[i];
            if( length >= 5 )
            {
                this.drawTree(branch, toX, toY, angle + tree.angle, bias, ctx);
            }
        }
    }
};

Plant.prototype.draw_recursive = function(step, x, y, angle, curScale, bias, ctx)
{
    for( var i = 0; i < this.branchList.length; i++ )
    {
        var branch = this.branchList[i];
        var length = branch.length * curScale;
        angle = (1 - bias) * angle + bias * (Math.PI);
        
        var toX = x + length * Math.cos(angle + branch.angle);
        var toY = y + length * Math.sin(angle + branch.angle);

        var mX = this.posX - plantPlant.mouseX;
        var mY = this.posY - plantPlant.mouseY;
        var dist = (toX - mX) * (toX - mX) + (toY - mY) * (toY - mY);
        dist += 1;
        toX = toX + 100 * (toX - mX) / (Math.sqrt(dist) * 20);
        toY = toY + 100 * (toY - mY) / (Math.sqrt(dist) * 20);
        
        // draw line
        if( curScale * branch.length < 20 )
        {
            ctx.strokeStyle = plantPlant.color_leaf;
        }
        else if( curScale * branch.length < 60 )
        {
            ctx.strokeStyle = plantPlant.color_branch;
        }
        else
        {
            ctx.strokeStyle = plantPlant.color_stem;
        }
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(toX, toY);
        ctx.closePath();
        ctx.stroke();

        // draw child leaves
        if( step < this.maxStep && curScale * branch.length >= 4 )
        {
            this.draw_recursive(step + 1, toX, toY, angle + branch.angle, curScale * branch.scale, bias, ctx);
        }
    }
};

Plant.prototype.randomGenerate = function() {
    var tree = { symbol: this.gene.startSymbol, length: this.stemLength, angle: 0 };
    this.generate(tree, 1);
    console.log(tree);
    
    this.tree = tree;
};


Plant.prototype.generate = function(currentBranch, step) {
    if( step > this.maxStep ) {
        return;
    }
    
    var symbol = currentBranch.symbol;
    var rule = this.getRandomRule(symbol);
    
    if( rule )
    {
        var children = new Array();
        for( var i = 0; i < rule.children.length; i++)
        {
            var child = rule.children[i];
            var newBranch = { symbol: child.symbol, length: currentBranch.length * child.scale, angle: child.angle };
            this.generate(newBranch, step + 1);
            children.push(newBranch);
        }
        currentBranch.children = children;
    }
};

Plant.prototype.getRandomRule = function(symbol) {
    var ruleList = this.gene.ruleMap[symbol];
    if( ruleList )
    {
        var probabilityValue = 0;
        var randomProbability = Math.random();
        
        for( var i = 0; i < ruleList.length; i++ )
        {
            probabilityValue = probabilityValue + ruleList[i].probability;
            if( randomProbability < probabilityValue )
            {
                return ruleList[i];
            }
        }
        alert("could not get a rule. it may not be normalized the probability table.");
    }
    return null;
};
