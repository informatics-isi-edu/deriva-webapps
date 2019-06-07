function expectedValue() {
  this.strength = {
    names: [
      "Present (unspecified strength)", "Present (strong)", "Present (moderate)", "Present (weak)", "Uncertain", "Not Detected"
    ],
    imgs: [
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(unspecifiedStrength).gif",
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(strong).gif",
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(moderate).gif",
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/Present(weak).gif",
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/Uncertain.gif",
      "/resources/images/ExpressionMapping/ExpressionStrengthsKey/notDetected.gif"
    ]
  }

  this.pattern = {
    names: [
      "Homogeneous", "Graded", "Regional", "Spotted", "Ubiquitous", "Restricted", "Single cell"
    ],
    imgs: [
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Homogeneous.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Graded.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Regional.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Spotted.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Ubiquitous.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/Restricted.png",
      "/resources/images/ExpressionMapping/ExpressionPatternKey/SingleCell.png"
    ]
  }

  this.density = {
    names: [
      "High", "Medium", "Low"
    ],
    imgs: [
      "/resources/images/NerveDensity/RelativeToTotal/high.png",
      "/resources/images/NerveDensity/RelativeToTotal/medium.png",
      "/resources/images/NerveDensity/RelativeToTotal/low.png"
    ]
  }

  this.densityChange = {
    names: [
      "Increase, large", "Increase, small", "Decrease, large", "Decrease, small", "Contains note"
    ],
    imgs: [
      "/resources/images/NerveDensity/RelativeToP0/inc_large.png",
      "/resources/images/NerveDensity/RelativeToP0/inc_small.png",
      "/resources/images/NerveDensity/RelativeToP0/dec_large.png",
      "/resources/images/NerveDensity/RelativeToP0/dec_small.png"
    ]
  }

  this.containsNote = {
    imgs: [
    "/resources/images/NerveDensity/note.gif"
    ]
  }
  return this;
}
module.exports = new expectedValue();
