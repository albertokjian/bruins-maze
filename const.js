// Make sure the coordinate system work as:
//      x axis points right.
//      y axis points out.
//      z axis points up.
MODEL_TRANSFORM = Mat4.identity().times(Mat4.scale([1,1,-1]));
// Gravity constant
G = -0.4;
