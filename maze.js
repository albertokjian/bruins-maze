window.Maze = window.classes.Maze =
    class Maze {
        // TODO randomly generate this maze
        constructor(message) {
            // make sure number of horizontal walls = zspan / (wall_length + thickness)
            this.thickness = THICKNESS;
            this.wall_length = WALL_LENGTH; // how long is each wall
            this.num_walls = NUM_WALLS;
            this.yspan = THICKNESS; // from y = 0 to out of page in y axis
            this.seperation = this.wall_length + this.thickness;
            this.additional_walls = 0; // for level progression, make maze larger
            // S is start, E is end, X is wall
            /*
            this.layout = [
                "+-+-+-+-+",
                "|S      |",
                "+     +-+",
                "|     | |",
                "+   +-+-+",
                "|   |   |",
                "+ +-+-+-+",
                "|       |",
                "+-+-+-+-+"
            ];
            */
            this.layout;
            this.walls;
            this.player;
            this.endbox;
            this.create_new_maze();
        }

        create_message_maze() {
            this.walls = [];
            this.num_walls = 14;
            this.zspan = 13 * (WALL_LENGTH + THICKNESS); // left to right in z axis
            this.xspan = 14 * (WALL_LENGTH + THICKNESS); // down to up in x axis
            this.camera_location_y = 5 + 4/3 * this.zspan;
            let m = Mat4.look_at(Vec.of(0, this.camera_location_y, 0), Vec.of(0, 0, 0), Vec.of(0, 0, -1));
            this.camera_matrix = Mat4.inverse(m);
            this.layout = MESSAGE;
            this.create_maze();
        }

        create_new_maze() {
            this.walls = [];
            this.num_walls = NUM_WALLS + this.additional_walls;
            this.zspan = this.num_walls * (WALL_LENGTH + THICKNESS); // left to right in z axis
            this.xspan = this.num_walls * (WALL_LENGTH + THICKNESS); // down to up in x axis
            this.camera_location_y = 5 + 4/3 * this.zspan;
            let m = Mat4.look_at(Vec.of(0, this.camera_location_y, 0), Vec.of(0, 0, 0), Vec.of(0, 0, -1));
            this.camera_matrix = Mat4.inverse(m);
            this.layout = display_maze(generate_maze(this.num_walls, this.num_walls));
            this.create_maze();
        }

        create_maze() {
            for (let z_index = 0; z_index < this.layout.length; z_index++) {
                const str = this.layout[z_index];
                for (let x_index = 0; x_index < str.length; x_index++) {
                    let x = -this.xspan / 2 + x_index / 2 * this.seperation;
                    let z = -this.zspan / 2 + z_index / 2 * this.seperation;
                    switch (str[x_index]) {
                        case '+':
                            this.walls.push(new Box(this.thickness, this.yspan, this.thickness, 0, x, 0, z));
                            break;
                        case '-':
                            this.walls.push(new Box(this.wall_length, this.yspan, this.thickness, 0, x, 0, z));
                            break;
                        case '|':
                            this.walls.push(new Box(this.thickness, this.yspan, this.wall_length, 0, x, 0, z));
                            break;
                        case 'S':
                            this.player = new Player(x, z);
                            break;
                        case 'E':
                            this.endbox = new Box(this.wall_length, this.yspan, this.wall_length, Math.PI, x, 0, z);
                            break;
                    }
                }
            }
        }

        update_player(current_direction, dt) {
            return this.player.move(current_direction, dt, this.walls, this.endbox);
        }

        draw(graphics_state, shapes, materials) {
            // create a floor to have the maze on 
            let floor_model_transform = MODEL_TRANSFORM;
            floor_model_transform = floor_model_transform.times(Mat4.translation([0, -1 / 2, 0]));
            floor_model_transform = floor_model_transform.times(Mat4.scale([this.xspan / 2, 1 / 2, this.zspan / 2]));
            shapes.wall.draw(graphics_state, floor_model_transform, materials.floor);

            for (let wall of this.walls) {
                wall.draw(graphics_state, shapes.wall, materials.wall);
            }
            this.player.draw(graphics_state, shapes.player, materials.player);
            this.endbox.draw(graphics_state, shapes.wall, materials.endbox);
        }
    }