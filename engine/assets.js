// [005] Artwork manifest; error on missing art instead of drawing placeholder shapes.
export const RIG={back:['leg_far','leg_near','hip','torso','bust_l','bust_r','arm_l_upper','arm_l_fore','arm_r_upper','arm_r_fore','head']};
export const PIVOTS={head:[158,168],torso:[158,373],hip:[161,473],leg_far:[184,503],leg_near:[126,508],bust_l:[125,285],bust_r:[192,286],arm_l_upper:[89,213],arm_l_fore:[48,359],arm_r_upper:[245,214],arm_r_fore:[281,359]};
export const LAYER_ORDER=['leg_far','leg_near','hip','torso','bust_l','bust_r','arm_l_upper','arm_r_upper','arm_l_fore','arm_r_fore','head'];
export async function loadArtwork(){let result={};for(const name of LAYER_ORDER){result[name]=await PIXI.Assets.load(`assets/rig/${name}.webp`)}return result}
