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
            this.currrent_direction = DIRECTIONS.STILL;
            this.lights = [new Light(Vec.of(0, 0, 0, 1), Color.of(.5, 1, 0, 1), 100000)];
            this.player = this.maze.player;
            this.attached = () => this.initial_camera_location;
        }

        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View entire maze", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("View player", ["1"], () => this.attached = () => this.player_camera_location);
            this.new_line();
            this.key_triggered_button("Move Up", ["i"], () => {
                this.currrent_direction = DIRECTIONS.UP;
            });
            this.new_line();
            this.key_triggered_button("Move Left", ["j"], () => {
                this.currrent_direction = DIRECTIONS.LEFT;
            });
            this.new_line();
            this.key_triggered_button("Move Right", ["l"], () => {
                this.currrent_direction = DIRECTIONS.RIGHT;
            });
        }

        display(graphics_state) {
            graphics_state.lights = this.lights; // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000,
                dt = graphics_state.animation_delta_time / 1000;
            
                this.shapes.axis.draw(graphics_state, MODEL_TRANSFORM.times(Mat4.translation([0, 10, 0])), this.materials.player);
            this.maze.draw(graphics_state, this.shapes, this.materials);            
        }
    };