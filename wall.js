window.Wall = window.classes.Wall =
    class Wall {
        constructor(xscale, yscale, zscale, angle, x, y, z) {
            this.model_transform = MODEL_TRANSFORM;
            this.create_wall(xscale, yscale, zscale, angle, x, y, z);
            this.x; // position x
            this.y; // position y
            this.z; // position z
            this.w = xscale; // x width
            this.d = yscale; // y depth
            this.h = zscale; // z height
        }

        create_aabb() {
            let pos = this.model_transform.times(Vec.of(0, 0, 0, 1));
            this.x = pos[0];
            this.y = pos[1];
            this.z = pos[2];
        }

        // Use transformation matrices to properly position a wall of a given width, height, depth at x, y, with specified rotation angle
        create_wall(xscale, yscale, zscale, angle, x, y, z) {
            // M = T(x,y,z) * Ry(angle) * S(scalex, scaley, scalez)
            this.model_transform = this.model_transform.times(Mat4.translation([x, y, z]));
            this.model_transform = this.model_transform.times(Mat4.rotation(angle, Vec.of(0, 1, 0)));
            this.model_transform = this.model_transform.times(Mat4.scale([xscale, yscale, zscale]));
            // push 4 coordinates of wall into array, counterclockwise from bottom left
            // Make 1x1x1 unit cube
            this.model_transform = this.model_transform.times(Mat4.scale([.5, .5, .5]));
            // translate walls up one, so the 2x2 cube is entirely on positive y 
            // imagine the original 2x2 was only entirely on positive y
            // but identity means it is moved down y is [-1, 1], so move it back up
            this.model_transform = this.model_transform.times(Mat4.translation([0, 1, 0]));
            this.create_aabb();
        }

        draw(graphics_state, shapes, materials) {
            shapes.wall.draw(graphics_state, this.model_transform, materials.wall);
        }
    }