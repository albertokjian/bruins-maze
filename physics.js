function UpdateVelocity(v0, a, dt) {
    let v = v0 + a * dt;
    return v;
}

function UpdateLocation(x0, v0, a0, dt) {
    let x = x0 + v0 * dt + .5 * a0 * (dt * dt);
    let v = v0 + a0 * dt;
    let a = a0;
    return [x, v, a];
}

function ApplyFriction(x) {
    return FRICTION * x;
}

const COLLISIONS = {
    STILL: 0,
    TOP: 1,
    BOTTOM: 2,
    LEFT: 4,
    RIGHT: 8
}


// http://www.jeffreythompson.org/collision-detection/circle-rect.php
function CircleRect(cx, cz, radius, game_object) {
    let rx = game_object.x, rz = game_object.z;
    let rw = game_object.w, rh = game_object.h;

    let status = COLLISIONS.STILL;
    // temporary variables to set edges for testing
    let test_x = cx;
    let test_z = cz;

    // which edge is closest?
    if (cx < rx - rw / 2) {
        test_x = rx - rw / 2; // test left edge
        status = status | COLLISIONS.LEFT;
    } else if (cx > rx + rw / 2) {
        test_x = rx + rw / 2; // right edge
        status = status | COLLISIONS.RIGHT;
    }
    if (cz < rz - rh / 2) {
        test_z = rz - rh / 2; // top edge
        status = status | COLLISIONS.TOP;
    } else if (cz > rz + rh / 2) {
        test_z = rz + rh / 2; // bottom edge
        status = status | COLLISIONS.BOTTOM;
    }

    // get distance from closest edges
    let dist_x = cx - test_x;
    let dist_z = cz - test_z;
    let distance = Math.sqrt((dist_x * dist_x) + (dist_z * dist_z));

    // if the distance is less than the radius, collision!
    if (distance <= radius) {
        return [true, status];
    }
    return [false, status];
}