var assetCodes = {
                    XBT: 63488,
                    GBP: 64032
                  };

var quantityScaleFactors = {
                              63488: 10000,
                              64032: 100
                            };

var priceScaleFactors = {
                          "XBT:GBP": 100
                        }

module.exports = {
  getAssetCode: function(assetString){
      return assetCodes[assetString];
  },

  scaleOutputQuantity: function(assetString, value){
      return value/quantityScaleFactors[assetCodes[assetString]];
  },

  scaleOutputPrice: function(assetPairString, value){
      return value/priceScaleFactors[assetPairString];
  },

  scaleInputQuantity: function(assetString, value){
      return value*quantityScaleFactors[assetCodes[assetString]];
  },

  scaleInputPrice: function(assetPairString, value){
      return value*priceScaleFactors[assetPairString];
  }
}
