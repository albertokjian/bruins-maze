function player_collide_with_a_side(p1,p2){
    console.log("LOL")
    var radius = 0.1;
    var player_x = this.player_position[0];
    var player_z = this.player_position[2];
    var side1 = Math.sqrt(Math.pow(player_x - p1.x,2) + Math.pow(player_z - p1.z,2)); // Thats the pythagoras theoram If I can spell it right
    var side2 = Math.sqrt(Math.pow(player_x - p2.x,2) + Math.pow(player_z - p2.z,2));
    var base = Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.z - p1.z,2));
    if(radius > side1 || radius > side2)
        return true;
    var angle1 = Math.atan2( p2.x - p1.x, p2.z - p1.z ) - Math.atan2( player_x - p1.x, player_z - p1.z ); // Some complicated Math
    var angle2 = Math.atan2( p1.x - p2.x, p1.z - p2.z ) - Math.atan2( player_x - p2.x, player_z - p2.z ); // Some complicated Math again
    if(angle1 > Math.PI / 2 || angle2 > Math.PI / 2) // Making sure if any angle is an obtuse one and Math.PI / 2 = 90 deg
        return false;

    // Now if none are true then
    var semiperimeter = (side1 + side2 + base) / 2;
    var areaOfTriangle = Math.sqrt( semiperimeter * (semiperimeter - side1) * (semiperimeter - side2) * (semiperimeter - base) ); // Heron's formula for the area
    var height = 2*areaOfTriangle/base;
    if( height < radius )
        return true;
    else
        return false;
}

function player_collide_with_a_wall(wall_item) {
    // now hardcoded to 4.
    let collide_bottom = player_collide_with_a_side(wall_item.bl,wall_item.br);
    if (collide_bottom) { console.log("Collide Bottom.")}
    let collide_top = player_collide_with_a_side(wall_item.tl,wall_item.tr);
    if (collide_top) { console.log("Collide Top.")}
    let collide_left = player_collide_with_a_side(wall_item.bl,wall_item.tl);
    if (collide_left) { console.log("Collide Left.")}
    let collide_right = player_collide_with_a_side(wall_item.br,wall_item.tr);
    if (collide_right) { console.log("Collide Right.")}
}

function player_collide_with_walls(wall_positions){
    let wall_item;
    for (wall_item of wall_positions) {
        player_collide_with_a_wall(wall_item);
    }
}

