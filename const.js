// Make sure the coordinate system work as:
//      x axis points right.
//      y axis points out.
//      z axis points up.
MODEL_TRANSFORM = Mat4.identity(); //.times(Mat4.scale([1,1,-1]));
G = 200; // Gravity constant
BALL_RADIUS = 2
COLLISION_SPEED = 0.8; // The amount of speed retained after a collision
SIZE_X = 64;
SIZE_Y = 64;
SPEED_UP = -100;
SPEED_LIMIT_X = 20;
SPEED_SIDE = 10;
SPEED_LIMIT_Z = 100;
SPEED_CUTOFF = 60;
FRICTION = 0.99;
const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    STILL: 'still'
}
Object.freeze(DIRECTIONS);