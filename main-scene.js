window.Trapped_Maze_Scene = window.classes.Trapped_Maze_Scene =
    class Trapped_Maze_Scene extends Scene_Component {
        constructor(context, control_box) // The scene begins by requesting the camera, shapes, and materials it will need.
        {
            super(context, control_box); // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            this.maze = new Maze();
            context.globals.graphics_state.camera_transform = Mat4.inverse(this.maze.camera_matrix);
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
                }),
                // endbox: context.get_instance(Phong_Shader).material(Color.of(1,1,1,1), {
                //     ambient: 1,
                // })
                endbox: context.get_instance(Phong_Shader).material(
                    Color.of(0, 0, 0, 1), {
                        ambient: 1,
                        texture: context.get_instance("assets/ucla2020.png", true)
                    }
                )
            };
            // this.current_direction = DIRECTIONS.STILL;
            this.current_direction = {
                up: false,
                left: false,
                right: false
            }
            this.lights = [new Light(Vec.of(0, 0, 0, 1), Color.of(1, 1, 1, 1), 100000)];
            // this.player = this.maze.player;
            this.attached = () => this.maze.camera_matrix;
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View entire maze", ["0"], () => this.attached = () => this.maze.camera_matrix);
            this.new_line();
            this.key_triggered_button("View player", ["1"], () => this.attached = () => this.maze.player.model_transform.times(Mat4.translation([0, 20, 0]).times(Mat4.rotation(3 * Math.PI / 2, Vec.of(1, 0, 0)))));
            this.new_line();
            this.key_triggered_button("Send Message", ["b"], () => {
                this.maze.create_message_maze();
                this.attached = () => this.maze.camera_matrix;
                // this.player = this.maze.player;
            });
            this.new_line();
            this.key_triggered_button("Jump Up", ["i"], () => {
                    this.current_direction.up = true;
                },
                undefined,
                () => {
                    this.current_direction = {
                        up: false,
                        left: false,
                        right: false
                    }
                });
            this.new_line();
            this.key_triggered_button("Move Left", ["j"], () => {
                    this.current_direction.left = true;
                },
                undefined,
                () => {
                    this.current_direction = {
                        up: false,
                        left: false,
                        right: false
                    }
                    // this.current_direction.left = false;
                });
            this.new_line();
            this.key_triggered_button("Move Right", ["l"], () => {
                    this.current_direction.right = true;
                },
                undefined,
                () => {
                    this.current_direction = {
                        up: false,
                        left: false,
                        right: false
                    }
                    // this.current_direction.right = false;
                });
            this.new_line();
            this.key_triggered_button("Left jump", ["u"], () => {
                    this.current_direction.left = true;
                    this.current_direction.up = true;
                },
                undefined,
                () => {
                    this.current_direction = {
                        up: false,
                        left: false,
                        right: false
                    }
                    // this.current_direction.right = false;
                });
            this.new_line();
            this.key_triggered_button("Right jump", ["o"], () => {
                    this.current_direction.right = true;
                    this.current_direction.up = true;
                },
                undefined,
                () => {
                    this.current_direction = {
                        up: false,
                        left: false,
                        right: false
                    }
                    // this.current_direction.right = false;
                });
            this.new_line();
            this.key_triggered_button("Restart", ["m"], () => {
                this.maze.create_maze();
                // this.player = this.maze.player;
            });
            this.new_line();
            this.key_triggered_button("Create New Maze", ["n"], () => {
                this.maze.create_new_maze();
                this.attached = () => this.maze.camera_matrix;
                // this.player = this.maze.player;
            });
        }

        display(graphics_state) {
            graphics_state.lights = this.lights; // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000,
                // dt = graphics_state.animation_delta_time / 1000;
                dt = 1 / FPS;
            // this.shapes.axis.draw(graphics_state, MODEL_TRANSFORM.times(Mat4.translation([0, 10, 0])).times(Mat4.scale([1,1,-1])), this.materials.player);
            if (this.maze.update_player(this.current_direction, dt)) { // level complete
                this.maze.additional_walls++;
                this.maze.zspan = (NUM_WALLS + this.maze.additional_walls) * (WALL_LENGTH + THICKNESS); // left to right in z axis
                this.maze.xspan = (NUM_WALLS + this.maze.additional_walls) * (WALL_LENGTH + THICKNESS); // down to up in x axis
                this.maze.create_new_maze();
                this.attached = () => this.maze.camera_matrix;
                // this.player = this.maze.player; // update player accordingly
            }
            this.maze.draw(graphics_state, this.shapes, this.materials);

            // Desired camera matrix
            if (this.attached != undefined) {
                // let desired = Mat4.inverse(this.attached().times(Mat4.translation([0, 0, 5 + this.maze.additional_walls * this.maze.additional_walls * 0.9])));
                let desired = Mat4.inverse(this.attached());
                let blending_factor = 0.1;
                graphics_state.camera_transform = desired.map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix(x, blending_factor));
            }
        }
    };