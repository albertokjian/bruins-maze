window.Maze = window.classes.Maze =
    class Maze {
        // TODO randomly generate this maze
        constructor() {
            this.width = 32;
            this.length = 32;
            this.height = 8;
            this.wall_length = 6; // how long is each X
            this.depth = 2;
            this.dim = Math.max(this.width, this.height);
            // S is start, E is end, X is wall
            this.walls = [
                "+-+-+-+S+",
                "|   |   |",
                "+ +-+ +-+",
                "|       |",
                "+ +-+-+-+",
                "|   |   |",
                "+ + +-+ +",
                "| |     E",
                "+-+-+-+-+"
            ];
            // TODO use different symbol for walls with different properties
        }
    }