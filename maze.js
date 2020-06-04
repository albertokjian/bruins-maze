window.Maze = window.classes.Maze =
    class Maze {
        // TODO randomly generate this maze
        constructor() {
            this.zspan = 64; // left to right in z axis
            this.xspan = 64; // down to up in x axis
            this.yspan = 8; // from y = 0 to out of page in y axis

            // TODO separate z and x wall length
            // make sure number of horizontal walls = zspan / (wall_length + thickness)
            this.wall_length = 11; // how long is each X
            // this.thickness = 1.5; // how thick the walls are
            this.thickness = 5;
            // how far are nodes to each other without scaling
            this.seperation = this.wall_length + this.thickness;
            this.dim = Math.max(this.zspan, this.xspan);
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
            this.layout = display_maze(generate_maze(SIZE_X, SIZE_Y));

            // this.layout = [
            //     " - - - - ",
            //     "|       |",
            //     "+       +",
            //     "|       |",
            //     "+       +",
            //     "|       |",
            //     "+       +",
            //     "|       |",
            //     "+-+-+-+-+"
            // ]
            // TODO use different symbol for walls with different properties

            // TODO USE OOP TO CREATE ONE CLASS OF WALLS/COINS/FLAG(WIN)
            this.walls = [];
            this.coins = []; // TODO CREATE COIN CLASS
            this.player;
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
                            this.walls.push(new Wall(this.thickness, this.yspan, this.thickness, 0, x, 0, z));
                            break;
                        case '-':
                            this.walls.push(new Wall(this.wall_length, this.yspan, this.thickness, 0, x, 0, z));
                            break;
                        case '|':
                            this.walls.push(new Wall(this.thickness, this.yspan, this.wall_length, 0, x, 0, z));
                            break;
                        case 'S':
                            this.player = new Player(x, z);
                            break;
                    }
                }
            }
        }

        update_player(current_direction, dt) {
            this.player.move(current_direction, dt, this.walls, this.coins);
        }

        draw(graphics_state, shapes, materials) {
            // create a floor to have the maze on 
            let floor_model_transform = MODEL_TRANSFORM;
            floor_model_transform = floor_model_transform.times(Mat4.translation([0, -1 / 2, 0]));
            floor_model_transform = floor_model_transform.times(Mat4.scale([this.zspan / 2, 1 / 2, this.xspan / 2]));
            shapes.wall.draw(graphics_state, floor_model_transform, materials.floor);

            for (let wall of this.walls) {
                wall.draw(graphics_state, shapes, materials);
            }
            this.player.draw(graphics_state, shapes, materials);
        }
    }