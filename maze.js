window.Maze = window.classes.Maze =
    class Maze {
        // TODO randomly generate this maze
        constructor() {
            this.zspan = 64;  // left to right in z axis
            this.xspan = 64;  // down to up in x axis
            this.yspan = 8; // from y = 0 to out of page in y axis

            // TODO separate z and x wall length
            // make sure number of horizontal walls = zspan / (wall_length + thickness)
            this.wall_length = 13; // how long is each X
            // this.thickness = 1.5; // how thick the walls are
            this.thickness = 3;
            // how far are nodes to each other without scaling
            this.seperation = this.wall_length + this.thickness; 
            this.dim = Math.max(this.zspan, this.xspan);
            // S is start, E is end, X is wall
            this.walls = [
                "+-+-+-+-+",
                "|       |",
                "+     +-+",
                "|     | |",
                "+   +-+-+",
                "|   |   |",
                "+ +-+-+-+",
                "|       |",
                "+-+-+-+-+"
            ];
            // this.walls = [
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
        }
    }