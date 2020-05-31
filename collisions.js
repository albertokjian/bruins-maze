// collision functions
// whenever the player hits the top surface, he no longer jumps
// all wall boundary should be AABB (i.e. using same coordinate as our views)
// x points right and z points down

// let collision_status = {
//     no_collision: 0,
//     collision_vertical: 1,
//     collision_horizontal: 2
// }

// function player_collide_with_a_side(px, pz, p1, p2, distance) {
//     let side1 = Math.sqrt(Math.pow(px - p1.x,2) + Math.pow(pz - p1.z,2)); // Thats the pythagoras theoram If I can spell it right
//     let side2 = Math.sqrt(Math.pow(px - p2.x,2) + Math.pow(pz - p2.z,2));
//     let base = Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.z - p1.z,2));

//     let angle1 = Math.atan2( p2.x - p1.x, p2.z - p1.z ) - Math.atan2( px - p1.x, pz - p1.z ); // Some complicated Math
//     let angle2 = Math.atan2( p1.x - p2.x, p1.z - p2.z ) - Math.atan2( px - p2.x, pz - p2.z ); // Some complicated Math again
//     if(Math.abs(angle1) > Math.PI / 2 || Math.abs(angle2) > Math.PI / 2) // Making sure if any angle is an obtuse one and Math.PI / 2 = 90 deg
//         return false;

//     // Now if none are true then
//     let semiperimeter = (side1 + side2 + base) / 2;
//     let areaOfTriangle = Math.sqrt( semiperimeter * (semiperimeter - side1) * (semiperimeter - side2) * (semiperimeter - base) ); // Heron's formula for the area
//     let height = 2*areaOfTriangle/base;
//     return (height < distance);
// }

// function player_collide_with_a_wall(px, pz, vx, vz, wall_item, distance, dt) {
//     let collide_bottom = player_collide_with_a_side(px, pz, vx, vz, wall_item.bl, wall_item.br, distance, dt);
//     let collide_top = player_collide_with_a_side(px, pz, vx, vz, wall_item.tl, wall_item.tr, distance, dt);
//     let collide_left = player_collide_with_a_side(px, pz, vx, vz, wall_item.bl, wall_item.tl, distance, dt);
//     let collide_right = player_collide_with_a_side(px, pz, vx, vz, wall_item.br, wall_item.tr, distance, dt);
//     if ((collide_top || collide_bottom) && (collide_right || collide_left)) {
//         return ((wall_item.bl.x - wall_item.br.x) > (wall_item.bl.z - wall_item.tl.z)) ? collision_status.collision_horizontal : collision_status.collision_vertical;
//     }
//     if (collide_top || collide_bottom) {
//         return collision_status.collision_horizontal;
//     }
//     if (collide_right || collide_left) {
//         return collision_status.collision_vertical;
//     }
//     return collision_status.no_collision
// }

// function player_collide_on_one_surface(px, pz, vx, vz, wall_item, distance, dt) {
//     let collide_top = player_collide_with_a_side(px, pz, vx, vz, wall_item.tl, wall_item.tr, distance);
//     if (collide_top) {
//         console.log("On surface")
//     }
//     return collide_top;
// }

// function player_collide_on_surface(px, pz, vx, vz, wall_positions, distance, dt) {
//     let wall_item;
//     for (wall_item of wall_positions) {
//         if (player_collide_on_one_surface(px, pz, vx, vz, wall_item, distance, dt)) {
//             return true;
//         }
//     }
//     return false;
// }

// function player_collide_with_walls(px, pz, vx, vz, wall_positions, distance, dt) {
    
//     let collisions = [];

//     // Check X
//     for (let wall_item of wall_positions) {
//         let c = player_collide_with_a_wall(px, pz, vx, vz, wall_item, distance, dt);
//         if (c != collision_status.no_collision) {
//             collisions.push(c);
//         }
//     }
//     return collisions;
// }