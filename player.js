window.Player = window.classes.Player =
    class Player {
        constructor(px = -26, pz = 30) {
            this.position = {
                x: px,
                y: 5,
                z: pz
            };
            this.velocity = {
                x: 0,
                y: 0,
                z: 0
            };
            this.acceleration = {
                x: 0,
                y: 0,
                z: G
            }
            this.radius = BALL_RADIUS;
            this.model_transform = MODEL_TRANSFORM;
            this.create_model_transform();
        }

        create_model_transform() {
            let pos = this.position;
            let r = this.radius;
            this.model_transform = this.model_transform.times(Mat4.translation([pos.x, pos.y, pos.z]));
            this.model_transform = this.model_transform.times(Mat4.scale([r, r, r]));
        }

        // https://gamedev.stackexchange.com/questions/69339/2d-aabbs-and-resolving-multiple-collisions
        // Move the player along the X axis.
        // Check for colliding tiles.
        // Resolve X collision.
        // Move the player along the Y axis.
        // Check for colliding tiles.
        // Resolve Y collision.
        updatePlayer(dt) {
            // Update player location.
            this.position.x = UpdateLocation(this.position.x, this.velocity.x, this.acceleration.x, dt);
            this.position.z = UpdateLocation(this.position.z, this.velocity.z, this.acceleration.z, dt);
        }

        movePlayer(current_direction) {
            switch (currrent_direction) {
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
        }

        draw(graphics_state, shapes, materials) {
            shapes.player.draw(graphics_state, this.model_transform, materials.player);
        }
    }