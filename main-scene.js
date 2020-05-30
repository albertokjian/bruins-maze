window.Trapped_Maze_Scene = window.classes.Trapped_Maze_Scene =
    class Trapped_Maze_Scene extends Scene_Component {
        constructor(context, control_box) // The scene begins by requesting the camera, shapes, and materials it will need.
        {
            super(context, control_box); // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            this.maze = new Maze();
            this.dim = this.maze.dim;
            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0, 2 * this.dim, 0), Vec.of(0, 0, 0), Vec.of(0, 0, -1));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);
            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                player: new(Subdivision_Sphere)(4),
                wall: new Cube(),
                axis: new Axis_Arrows()
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials = {
                floor: context.get_instance(Phong_Shader).material(Color.of(1, .5, .5, 1), {
                    ambient: .4,
                    diffusivity: .7,
                    specular: 1.,
                    gouraud: true,
                }),
                player: context.get_instance(Phong_Shader).material(Color.of(.75, .75, .25, 1), {
                    ambient: .8,
                    diffusivity: .7,
                    specular: .5,
                    gouraud: true,
                }),
                wall: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {
                    ambient: .1,
                    diffusivity: .1,
                    specularity: .6,
                    gouraud: true,
                })
            };
            this.directions = {
                UP: 'up',
                DOWN: 'down',
                LEFT: 'left',
                RIGHT: 'right',
                STILL: 'still'
            }
            this.currrent_direction = this.directions.STILL;
            this.lights = [new Light(Vec.of(0, 0, 0, 1), Color.of(.5, 1, 0, 1), 100000)];


            this.model_transform = MODEL_TRANSFORM;
            this.wall_positions = [];
            this.store_walls_pos();
            this.player = new Player();
            this.in_collision = false;
            this.attached = () => this.initial_camera_location;
        }
        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View entire maze", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("View player", ["1"], () => this.attached = () => this.player_camera_location);
            this.new_line();
            this.key_triggered_button("Move Up", ["i"], () => {
                this.currrent_direction = this.directions.UP;
            });
            this.new_line();
            this.key_triggered_button("Move Left", ["j"], () => {
                this.currrent_direction = this.directions.LEFT;
            });
            this.new_line();
            this.key_triggered_button("Move Right", ["l"], () => {
                this.currrent_direction = this.directions.RIGHT;
            });
        }

        // Use transformation matrices to properly position a wall of a given width, height, depth at x, y, with specified rotation angle
        create_wall(graphics_state, xscale, yscale, zscale, angle, x, y, z = 0) {
            let model_transform = this.model_transform;
            model_transform = model_transform.times(Mat4.scale([1, 1, -1]));
            // M = T(x,y,z) * Ry(angle) * S(scalex, scaley, scalez)
            model_transform = model_transform.times(Mat4.translation([x, y, z]));
            model_transform = model_transform.times(Mat4.rotation(angle, Vec.of(0, 1, 0)));
            model_transform = model_transform.times(Mat4.scale([xscale, yscale, zscale]));
            // push 4 coordinates of wall into array, counterclockwise from bottom left
            // Make 1x1x1 unit cube
            model_transform = model_transform.times(Mat4.scale([.5, .5, .5]));
            // translate walls up one, so the 2x2 cube is entirely on positive y 
            // imagine the original 2x2 was only entirely on positive y
            // but identity means it is moved down y is [-1, 1], so move it back up
            model_transform = model_transform.times(Mat4.translation([0, 1, 0]));
            this.shapes.wall.draw(graphics_state, model_transform, this.materials.wall);
        }

        store_a_wall_pos(xscale, yscale, zscale, angle, x, y, z) {
            let model_transform = this.model_transform;

            // M = T(x,y,z) * Ry(angle) * S(scalex, scaley, scalez)
            model_transform = model_transform.times(Mat4.translation([x, 0, z]));
            model_transform = model_transform.times(Mat4.rotation(angle, Vec.of(0, 1, 0)));
            model_transform = model_transform.times(Mat4.scale([xscale, 1, zscale]));

            // Make 1x1x1 unit cube
            model_transform = model_transform.times(Mat4.scale([.5, .5, .5]));
            // translate walls up one, so the 2x2 cube is entirely on positive y
            // imagine the original 2x2 was only entirely on positive y
            // but identity means it is moved down y is [-1, 1], so move it back up
            model_transform = model_transform.times(Mat4.translation([0, 1, 0]));

            let coord_arr = [
                [-1, 1],
                [1, 1],
                [-1, -1],
                [1, -1]
            ];
            let new_coord_arr = [];
            for (const xz of coord_arr) {
                let new_coord = model_transform.times(Vec.of(xz[0], 10, xz[1], 1));
                new_coord_arr.push({
                    x: new_coord[0],
                    z: new_coord[2]
                })
            }
            this.wall_positions.push({
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
            })
        }

        store_walls_pos() {
            for (let z_index = 0; z_index < this.maze.walls.length; z_index++) {
                const str = this.maze.walls[z_index];
                for (let x_index = 0; x_index < str.length; x_index++) {
                    let x = -this.maze.xspan / 2 + x_index / 2 * this.maze.seperation;
                    let z = -this.maze.zspan / 2 + z_index / 2 * this.maze.seperation;
                    switch (str[x_index]) {
                        case '+':
                            // x_index and z_index is guarante
                            this.store_a_wall_pos(this.maze.thickness, this.maze.yspan, this.maze.thickness, 0, x, 0, z);
                            break;
                        case '-':
                            this.store_a_wall_pos(this.maze.wall_length, this.maze.yspan, this.maze.thickness, 0, x, 0, z);
                            break;
                        case '|':
                            this.store_a_wall_pos(this.maze.thickness, this.maze.yspan, this.maze.wall_length, 0, x, 0, z);
                            break;
                    }
                }
            }
        }
        // TODO, read maze only once! store necessary information at the beginning
        create_maze(graphics_state) {
            for (let z_index = 0; z_index < this.maze.walls.length; z_index++) {
                const str = this.maze.walls[z_index];
                for (let x_index = 0; x_index < str.length; x_index++) {
                    let x = -this.maze.xspan / 2 + x_index / 2 * this.maze.seperation;
                    let z = -this.maze.zspan / 2 + z_index / 2 * this.maze.seperation;
                    switch (str[x_index]) {
                        case '+':
                            // x_index and z_index is guarante
                            this.create_wall(graphics_state, this.maze.thickness, this.maze.yspan, this.maze.thickness, 0, x, 0, z);
                            break;
                        case '-':
                            this.create_wall(graphics_state, this.maze.wall_length, this.maze.yspan, this.maze.thickness, 0, x, 0, z);
                            break;
                        case '|':
                            this.create_wall(graphics_state, this.maze.thickness, this.maze.yspan, this.maze.wall_length, 0, x, 0, z);
                            break;
                    }
                }
            }
        }

        draw_player(graphics_state, t) {
            switch (this.currrent_direction) {
                case this.directions.UP:
                    this.player.velocity.z = Math.min(1.5 * SPEED_UP, this.player.velocity.z + SPEED_UP);
                    // this.player_model_transform = this.player_model_transform.times(Mat4.translation([0, 0, -speed]));
                    break;
                case this.directions.LEFT:
                    this.player.velocity.x = Math.max(-2 * SPEED_SIDE, this.player.velocity.x - SPEED_SIDE);
                    // this.player_model_transform = this.player_model_transform.times(Mat4.translation([-speed, 0, 0]));
                    break;
                case this.directions.RIGHT:
                    this.player.velocity.x = Math.min(2 * SPEED_SIDE, this.player.velocity.x + SPEED_SIDE);
                    // this.player_model_transform = this.player_modezl_transform.times(Mat4.translation([speed, 0,0]));
                default:
                    break;
            }
            this.currrent_direction = this.directions.STILL;
            this.shapes.player.draw(graphics_state, this.player.getPlayerLModel(), this.materials.player);
        }
        display(graphics_state) {
            graphics_state.lights = this.lights; // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000,
                dt = graphics_state.animation_delta_time / 1000;


            // create a floor to have the maze on 
            let floor_model_transform = this.model_transform;
            floor_model_transform = floor_model_transform.times(Mat4.translation([0, -1 / 2, 0]));
            floor_model_transform = floor_model_transform.times(Mat4.scale([this.maze.zspan / 2, 1 / 2, this.maze.xspan / 2]));
            this.shapes.wall.draw(graphics_state, floor_model_transform, this.materials.floor);
            this.shapes.axis.draw(graphics_state, this.model_transform.times(Mat4.translation([0, 10, 0])), this.materials.player);
            this.create_maze(graphics_state);
            //
            // // TODO: change camera location to be front view
            // this.player_camera_location = this.player_model_transform;
            // let player_vec = this.player_model_transform.times(Vec.of(0,0,0,1));
            //
            // // light comes from within the player
            // this.lights[0].position = player_vec;
            let collisions = player_collide_with_walls(this.player.position.x, this.player.position.z, this.wall_positions, BALL_RADIUS);
            let collide_on_surface = player_collide_on_surface(this.player.position.x, this.player.position.z, this.wall_positions, BALL_RADIUS);
            this.player.updatePlayer(collisions, this.in_collision, collide_on_surface, dt);
            this.in_collision = collisions.length !==0;
            this.draw_player(graphics_state, dt);
        }
    };