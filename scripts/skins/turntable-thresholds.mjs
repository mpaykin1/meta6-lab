// Permanent acceptance floors. Changes require new owner-approved rule, never a quiet downgrade.
export const LIMITS=Object.freeze({
 angles:Object.freeze([0,45,90,135,180,225,270,315]),
 sideTorsoWidth:0.50,
 bodyDepthToWidth:0.60,
 maximumLargeComponents:1,
 largeComponentFraction:0.015,
 sideFaceHashSimilarity:0.90,
 outlineCoverage:0.80,
 silhouetteContrast:2.50,
 outlineColor:'#1a0f14'
});
