// Make sure the coordinate system work as:
//      x axis points right.
//      y axis points out.
//      z axis points up.
MODEL_TRANSFORM = Mat4.identity(); //.times(Mat4.scale([1,1,-1]));
G = 80; // Gravity constant
COLLISION_SPEED = 0.5; // The amount of speed retained after a collision
NUM_WALLS = 2; // number of walls per side
THICKNESS = 2;
WALL_LENGTH = 4;
BALL_RADIUS = THICKNESS / 3;
SPEED_UP = -20;
SPEED_LIMIT_X = 20;
SPEED_SIDE = 5;
SPEED_LIMIT_Z = 100;
SPEED_CUTOFF = 20;
FRICTION = 0.9;
FPS = 60;
const DIRECTIONS = {
    UP: 'up',
    DOWN: 'down',
    LEFT: 'left',
    RIGHT: 'right',
    STILL: 'still'
}
Object.freeze(DIRECTIONS);