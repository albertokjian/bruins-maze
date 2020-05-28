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
            this.materials =
                {
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
            // this.player_model_transform = this.init_player_location();
            // this.player_position = [0,0,0];
            this.directions = {
                UP: 'up',
                DOWN: 'down',
                LEFT: 'left',
                RIGHT: 'right',
                STILL:'still'
            }
            this.current_time = 0;
            this.currrent_direction = this.directions.STILL;
            this.lights = [new Light(Vec.of(0, 0, 0, 1), Color.of(.5, 1, 0, 1), 100000)];


            this.model_transform = MODEL_TRANSFORM
            this.wall_positions = [];
            this.store_walls_pos();
            this.c=0;
            this.player = new Player();
            this.in_collision = false;
            this.attached = () => this.initial_camera_location;
        }
        // init_player_location() {
        //     let player_model_transform = Mat4.identity();
        //     player_model_transform = player_model_transform.times(Mat4.translation([this.dim - 8, 3, this.dim - 8]));
        //     player_model_transform = player_model_transform.times(Mat4.scale([2,2,2]));
        //     return player_model_transform
        // }
        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View entire maze", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("View player", ["1"], () => this.attached = () => this.player_camera_location);
            this.new_line();
            this.key_triggered_button("Move Up", ["i"], () => {
                this.currrent_direction = this.directions.UP;
                // console.log(this.wall_positions[0])
                // console.log(this.player_position);
            });
            this.new_line();
            this.key_triggered_button("Move Down", ["k"], () => {
                this.currrent_direction = this.directions.DOWN;
                // console.log(this.wall_positions[0])
                // console.log(this.player_position);
            });
            this.new_line();
            this.key_triggered_button("Move Left", ["j"], () => {
                this.currrent_direction = this.directions.LEFT;
                // console.log(this.wall_positions[0])
                // console.log(this.player_position);
            });
            this.new_line();
            this.key_triggered_button("Move Right", ["l"], () => {
                this.currrent_direction = this.directions.RIGHT;
                // console.log(this.wall_positions[0])
                // console.log(this.player_position);
            });
            this.new_line();
            this.key_triggered_button("Stay still", ["m"], () => {
                this.currrent_direction = this.directions.STILL;
                // console.log(this.wall_positions[0])
                // console.log(this.player_position);
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
            this.shapes.wall.draw(graphics_state,model_transform, this.materials.wall);
        }

        store_a_wall_pos( xscale, yscale, zscale, angle, x, y, z) {
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

            let coord_arr = [[-1,1], [1,1], [-1,-1], [1,-1]];
            let new_coord_arr = [];
            for (const xz of coord_arr) {
                let new_coord = model_transform.times(Vec.of(xz[0], 10, xz[1], 1));
                new_coord_arr.push({x:new_coord[0],z:new_coord[2]})
            }
            this.wall_positions.push({
                bl:{x:new_coord_arr[0].x,z:new_coord_arr[0].z},
                br:{x:new_coord_arr[1].x,z:new_coord_arr[1].z},
                tl:{x:new_coord_arr[2].x,z:new_coord_arr[2].z},
                tr:{x:new_coord_arr[3].x,z:new_coord_arr[3].z}})
        }

        store_walls_pos(){
            for (let z_index = 0; z_index < this.maze.walls.length; z_index++) {
                const str = this.maze.walls[z_index];
                for (let x_index = 0; x_index < str.length; x_index++) {
                    let x = -this.maze.xspan / 2 + x_index / 2 * this.maze.seperation;
                    let z = -this.maze.zspan / 2 + z_index / 2 * this.maze.seperation;
                    switch (str[x_index]) {
                        case '+':
                            // x_index and z_index is guarante
                            this.store_a_wall_pos( this.maze.thickness, this.maze.yspan, this.maze.thickness, 0, x, 0 ,z);
                            break;
                        case '-':
                            this.store_a_wall_pos( this.maze.wall_length, this.maze.yspan, this.maze.thickness, 0, x, 0 ,z);
                            break;
                        case '|':
                            this.store_a_wall_pos( this.maze.thickness, this.maze.yspan, this.maze.wall_length, 0, x, 0 ,z);
                            break;
                    }
                }
            }
        }
        // player_collide_with_a_side(p1,p2){
        //     var radius = 0.1;
        //     var player_x = this.player_position[0];
        //     var player_z = this.player_position[2];
        //     var side1 = Math.sqrt(Math.pow(player_x - p1.x,2) + Math.pow(player_z - p1.z,2)); // Thats the pythagoras theoram If I can spell it right
        //     var side2 = Math.sqrt(Math.pow(player_x - p2.x,2) + Math.pow(player_z - p2.z,2));
        //     var base = Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.z - p1.z,2));
        //     if(radius > side1 || radius > side2)
        //         return true;
        //     var angle1 = Math.atan2( p2.x - p1.x, p2.z - p1.z ) - Math.atan2( player_x - p1.x, player_z - p1.z ); // Some complicated Math
        //     var angle2 = Math.atan2( p1.x - p2.x, p1.z - p2.z ) - Math.atan2( player_x - p2.x, player_z - p2.z ); // Some complicated Math again
        //     if(angle1 > Math.PI / 2 || angle2 > Math.PI / 2) // Making sure if any angle is an obtuse one and Math.PI / 2 = 90 deg
        //         return false;
        //
        //     // Now if none are true then
        //     var semiperimeter = (side1 + side2 + base) / 2;
        //     var areaOfTriangle = Math.sqrt( semiperimeter * (semiperimeter - side1) * (semiperimeter - side2) * (semiperimeter - base) ); // Heron's formula for the area
        //     var height = 2*areaOfTriangle/base;
        //     if( height < radius )
        //         return true;
        //     else
        //         return false;
        // }
        // player_collide_with_a_wall(wall_item) {
        //     // now hardcoded to 4.
        //     var collide_bottom = this.player_collide_with_a_side(wall_item.bl,wall_item.br);
        //     if (collide_bottom) { console.log("Collide Bottom.")}
        //     var collide_top = this.player_collide_with_a_side(wall_item.tl,wall_item.tr);
        //     if (collide_top) { console.log("Collide Top.")}
        //     var collide_left = this.player_collide_with_a_side(wall_item.bl,wall_item.tl);
        //     if (collide_left) { console.log("Collide Left.")}
        //     var collide_right = this.player_collide_with_a_side(wall_item.br,wall_item.tr);
        //     if (collide_right) { console.log("Collide Right.")}
        //
        // }
        // player_collide_with_walls(){
        //     var wall_item;
        //     for (wall_item of this.wall_positions) {
        //         this.player_collide_with_a_wall(wall_item);
        //     }
        // }
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
                            this.create_wall(graphics_state, this.maze.thickness, this.maze.yspan, this.maze.thickness, 0, x, 0 ,z);
                            break;
                        case '-':
                            this.create_wall(graphics_state, this.maze.wall_length, this.maze.yspan, this.maze.thickness, 0, x, 0 ,z);
                            break;
                        case '|':
                            this.create_wall(graphics_state, this.maze.thickness, this.maze.yspan, this.maze.wall_length, 0, x, 0 ,z);
                            break;
                    }
                }
            }
        }

        draw_player(graphics_state, t) {
            // this.player.resetSpeed();
            switch (this.currrent_direction) {
                case this.directions.UP:
                    this.player.velocity.z += SPEED_UP;
                    // this.player_model_transform = this.player_model_transform.times(Mat4.translation([0, 0, -speed]));
                    break;
                case this.directions.LEFT:
                    this.player.velocity.x -= SPEED_SIDE;
                    // this.player_model_transform = this.player_model_transform.times(Mat4.translation([-speed, 0, 0]));
                    break;
                case this.directions.RIGHT:
                    this.player.velocity.x += SPEED_SIDE;
                    // this.player_model_transform = this.player_modezl_transform.times(Mat4.translation([speed, 0,0]));
                default:
                    break;
            }
            this.currrent_direction = this.directions.STILL;
            this.shapes.player.draw(graphics_state, this.player.getPlayerLModel(), this.materials.player);
        }
        display(graphics_state) {
            graphics_state.lights = this.lights; // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;


            // create a floor to have the maze on 
            let floor_model_transform = this.model_transform;
            floor_model_transform = floor_model_transform.times(Mat4.translation([0, -1/2, 0]));
            floor_model_transform = floor_model_transform.times(Mat4.scale([this.maze.zspan / 2, 1/2, this.maze.xspan / 2]));
            this.shapes.wall.draw(graphics_state, floor_model_transform, this.materials.floor);
            this.shapes.axis.draw(graphics_state,this.model_transform.times(Mat4.translation([0,10,0])),this.materials.player);
            this.create_maze(graphics_state);
            //
            // // TODO: change camera location to be front view
            // this.player_camera_location = this.player_model_transform;
            // let player_vec = this.player_model_transform.times(Vec.of(0,0,0,1));
            //
            // // light comes from within the player
            // this.lights[0].position = player_vec;
            let px = this.player.position.x;
            let pz = this.player.position.z;
            // console.log(this.wall_positions)
            let collision = player_collide_with_walls(px, pz, this.wall_positions,0,3.5);
            let collide_on_surface = player_collide_on_surface(px, pz, this.wall_positions,0,3.5);
            this.player.updatePlayer(collision, this.in_collision, collide_on_surface, dt);
            this.in_collision = collision;
            this.draw_player(graphics_state,dt);
            console.log("speed",this.player.velocity);
            // this.current_time = t;
        }
    };