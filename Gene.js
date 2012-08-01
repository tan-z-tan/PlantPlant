function PlantGene(startSymbol) {
    this.ruleList = new Array();
    this.startSymbol = startSymbol;
    this.ruleMap = {};
}

PlantGene.prototype.addRule = function(rule) {
    //var rule = {left: left, right: rightList, probability: probability};
    this.ruleList.push( rule );
    if( this.ruleMap[rule.symbol] )
    {
        this.ruleMap[rule.symbol].push(rule);
    }
    else
    {
        this.ruleMap[rule.symbol] = [rule];
    }
};

PlantGene.prototype.normalize = function() {
    
};
