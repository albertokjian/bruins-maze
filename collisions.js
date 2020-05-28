function player_collide_with_a_side(px, pz, p1, p2, distance1, distance2){
    // console.log("LOL")
    // let radius = distance;
    let player_x = px;
    let player_z = pz
    let side1 = Math.sqrt(Math.pow(player_x - p1.x,2) + Math.pow(player_z - p1.z,2)); // Thats the pythagoras theoram If I can spell it right
    let side2 = Math.sqrt(Math.pow(player_x - p2.x,2) + Math.pow(player_z - p2.z,2));
    let base = Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.z - p1.z,2));
    // if(radius > side1 || radius > side2)
    //     return true;
    let angle1 = Math.atan2( p2.x - p1.x, p2.z - p1.z ) - Math.atan2( player_x - p1.x, player_z - p1.z ); // Some complicated Math
    let angle2 = Math.atan2( p1.x - p2.x, p1.z - p2.z ) - Math.atan2( player_x - p2.x, player_z - p2.z ); // Some complicated Math again
    if(Math.abs(angle1) > Math.PI / 2 || Math.abs(angle2) > Math.PI / 2) // Making sure if any angle is an obtuse one and Math.PI / 2 = 90 deg
        return false;

    // Now if none are true then
    let semiperimeter = (side1 + side2 + base) / 2;
    let areaOfTriangle = Math.sqrt( semiperimeter * (semiperimeter - side1) * (semiperimeter - side2) * (semiperimeter - base) ); // Heron's formula for the area
    let height = 2*areaOfTriangle/base;
    if(  height < distance2 )
        return true;
    else
        return false;
}

function player_collide_with_a_wall(px, pz, wall_item, distance1, distance2) {
    // now hardcoded to 4.
    let collide_bottom = player_collide_with_a_side(px, pz, wall_item.bl,wall_item.br, distance1, distance2);
    // if (collide_bottom) { console.log("Collide Bottom.")}
    let collide_top = player_collide_with_a_side(px, pz, wall_item.tl,wall_item.tr, distance1, distance2);
    // if (collide_top) { console.log("Collide Top.")}
    let collide_left = player_collide_with_a_side(px, pz, wall_item.bl,wall_item.tl,distance1, distance2);
    // if (collide_left) { console.log("Collide Left.")}
    let collide_right = player_collide_with_a_side(px, pz, wall_item.br,wall_item.tr,distance1, distance2);
    // if (collide_right) { console.log("Collide Right.")}
    return (collide_bottom || collide_left || collide_right || collide_top);
}

function player_collide_on_one_surface(px, pz, wall_item, distance1, distance2) {
    let collide_top = player_collide_with_a_side(px, pz, wall_item.tl,wall_item.tr, distance1, distance2);
    if (collide_top) { console.log("On surface")}
    return collide_top;
}
function player_collide_on_surface(px, pz, wall_positions, distance1, distance2){
    // console.log("LOL");
    let wall_item;
    for (wall_item of wall_positions) {
        if (player_collide_on_one_surface(px, pz, wall_item, distance1, distance2)){ return true;}
    }
    return false;
}
function player_collide_with_walls(px, pz, wall_positions, distance1, distance2){
    // console.log("LOL");
    let wall_item;
    for (wall_item of wall_positions) {
        if (player_collide_with_a_wall(px, pz, wall_item, distance1, distance2)){ return true;}
    }
    return false;
}

