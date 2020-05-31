window.Wall = window.classes.Wall =
    class Wall {
        constructor(xscale, yscale, zscale, angle, x, y, z) {
            this.model_transform = MODEL_TRANSFORM;
            this.create_wall(xscale, yscale, zscale, angle, x, y, z);
            this.wall_positions; //aabb model
        }

        store_corners_of_wall() {
            let coord_arr = [
                [-1, 1],
                [1, 1],
                [-1, -1],
                [1, -1]
            ];
            let new_coord_arr = [];
            for (const xz of coord_arr) {
                let new_coord = this.model_transform.times(Vec.of(xz[0], 10, xz[1], 1));
                new_coord_arr.push({
                    x: new_coord[0],
                    z: new_coord[2]
                })
            }
            this.wall_positions = {
                bl: {
                    x: new_coord_arr[0].x,
                    z: new_coord_arr[0].z
                },
                br: {
                    x: new_coord_arr[1].x,
                    z: new_coord_arr[1].z
                },
                tl: {
                    x: new_coord_arr[2].x,
                    z: new_coord_arr[2].z
                },
                tr: {
                    x: new_coord_arr[3].x,
                    z: new_coord_arr[3].z
                }
            }
        }

        // Use transformation matrices to properly position a wall of a given width, height, depth at x, y, with specified rotation angle
        create_wall(xscale, yscale, zscale, angle, x, y, z) {
            this.model_transform = this.model_transform.times(Mat4.scale([1, 1, -1]));
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
            this.store_corners_of_wall();
        }

        draw(graphics_state, shapes, materials) {
            shapes.wall.draw(graphics_state, this.model_transform, materials.wall);
        }
    }