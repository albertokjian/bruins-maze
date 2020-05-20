// Cube definition given in Assignment 2 template code
window.Cube = window.classes.Cube =
    class Cube extends Shape {
        constructor() {
            super("positions", "normals"); // Name the values we'll define per each vertex.  They'll have positions and normals.

            // First, specify the vertex positions -- just a bunch of points that exist at the corners of an imaginary cube.
            this.positions.push(...Vec.cast(
                [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
                [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
                [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]));
            // Supply vectors that point away from eace face of the cube.  They should match up with the points in the above list
            // Normal vectors are needed so the graphics engine can know if the shape is pointed at light or not, and color it accordingly.
            this.normals.push(...Vec.cast(
                [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
                [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
                [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]));

            // Those two lists, positions and normals, fully describe the "vertices".  What's the "i"th vertex?  Simply the combined
            // data you get if you look up index "i" of both lists above -- a position and a normal vector, together.  Now let's
            // tell it how to connect vertex entries into triangles.  Every three indices in this list makes one triangle:
            this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
            // It stinks to manage arrays this big.  Later we'll show code that generates these same cube vertices more automatically.
        }
    };

window.Trapped_Maze_Scene = window.classes.Trapped_Maze_Scene =
    class Trapped_Maze_Scene extends Scene_Component {
        constructor(context, control_box)     // The scene begins by requesting the camera, shapes, and materials it will need.
        {
            super(context, control_box);    // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            this.dim = 32;

            context.globals.graphics_state.camera_transform = Mat4.look_at(Vec.of(0,4*this.dim,0), Vec.of(0,0,0), Vec.of(1,0,0));
            this.initial_camera_location = Mat4.inverse(context.globals.graphics_state.camera_transform);
            const r = context.width / context.height;
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                player: new (Subdivision_Sphere)(4),
                wall: new Cube(),
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.materials =
                {
                    floor: context.get_instance(Phong_Shader).material(Color.of(1, .5, .5, 1), {
                        ambient: 0,
                        diffusivity: .7,
                        specular: 1.,
                        gouraud: true,
                    }),
                    player: context.get_instance(Phong_Shader).material(Color.of(1, .5, .5, 1), {
                        ambient: .8,
                        diffusivity: .7,
                        specular: .5,
                        gouraud: true,
                    }),
                    wall: context.get_instance(Phong_Shader).material(Color.of(1, 1, 1, 1), {
                        ambient: 0,
                        diffusivity: .4,
                        specularity: .6,
                    })
                };
            this.player_model_transform = this.init_player_location();

            this.lights = [new Light(Vec.of(0, 0, 0, 1), Color.of(.5, 1, 0, 1), 100000)];
            this.attached = () => this.initial_camera_location;
        }
        init_player_location() {
            let player_model_transform = Mat4.identity();
            player_model_transform = player_model_transform.times(Mat4.translation([this.dim - 8, 3, this.dim - 8]));
            player_model_transform = player_model_transform.times(Mat4.scale([2,2,2]));
            return player_model_transform
        }
        make_control_panel() {
            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
            this.key_triggered_button("View entire maze", ["0"], () => this.attached = () => this.initial_camera_location);
            this.new_line();
            this.key_triggered_button("View player", ["1"], () => this.attached = () => this.player_camera_location);
            this.new_line();
            this.key_triggered_button("Move Up", ["w"], () => {
                this.player_model_transform = this.player_model_transform.times(Mat4.translation([3, 0, 0]));
            });
            this.new_line();
            this.key_triggered_button("Move Down", ["s"], () => {
                this.player_model_transform = this.player_model_transform.times(Mat4.translation([-3, 0, 0]));
            });
            this.new_line();
            this.key_triggered_button("Move Left", ["a"], () => {
                this.player_model_transform = this.player_model_transform.times(Mat4.translation([0, 0, -3]));
            });
            this.new_line();
            this.key_triggered_button("Move Forward", ["d"], () => {
                this.player_model_transform = this.player_model_transform.times(Mat4.translation([0, 0, 3]));
            });

        }

        // Use transformation matrics to properly position a wall of a given width, height, depth at x, y, with specified rotation angle
        create_wall(graphics_state, width, height, depth, angle, x, y, z = 0) {
            let model_transform = Mat4.identity();
            model_transform = model_transform.times(Mat4.rotation(angle, Vec.of(0, 1, 0)));
            model_transform = model_transform.times(Mat4.scale([width, height, depth]));
            model_transform = model_transform.times(Mat4.translation([x, y, z]));
            this.shapes.wall.draw(graphics_state, model_transform, this.materials.wall);
        }

        create_maze(graphics_state) {
            // create a floor to have the maze on 
            let floor_model_transform = Mat4.identity();
            floor_model_transform = floor_model_transform.times(Mat4.scale([this.dim, 1, this.dim]));
            this.shapes.wall.draw(graphics_state, floor_model_transform, this.materials.floor);

            // create the 4 walls that surround the maze
            this.create_wall(graphics_state, this.dim, 8, 1, 0, 0, 1, this.dim);
            this.create_wall(graphics_state, this.dim, 8, 1, 0, 0, 1, -this.dim);
            this.create_wall(graphics_state, this.dim, 8, 1, Math.PI / 2, 0, 1, this.dim);
            this.create_wall(graphics_state, this.dim, 8, 1, Math.PI / 2, 0, 1, -this.dim);

            // create some walls in between
            this.create_wall(graphics_state, 8, 8, 1, 0, 0, 1, 3);
            this.create_wall(graphics_state, 4, 8, 1, Math.PI / 2, 0, 1, 3);
            this.create_wall(graphics_state, 8, 8, 1, 0, 3, 1, 15);
            this.create_wall(graphics_state, 8, 8, 1, Math.PI / 2, 3, 1, 15);

        }

        display(graphics_state) {
            graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
            const t = graphics_state.animation_time / 1000;

            this.create_maze(graphics_state);
            
            // TODO: change camera location to be front view
            this.player_camera_location = this.player_model_transform;
            let player_vec = this.player_model_transform.times(Vec.of(0,0,0,1));

            // light comes from within the player
            this.lights[0].position = player_vec;
            this.shapes.player.draw(graphics_state, this.player_model_transform, this.materials.player);

            if (typeof this.attached === "function") {
                let desired = this.attached();
                desired = Mat4.inverse(desired);
                graphics_state.camera_transform = desired.map((x, i) => Vec.from(graphics_state.camera_transform[i]).mix(x, .1));
            }
        }
    };