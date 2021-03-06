// Reference source: Rosetta Code
// https://rosettacode.org/wiki/Maze_generation#JavaScript
// With modifications to adapt to our maze conventions

function generate_maze(x,y) {
    var n=x*y-1;
    if (n<0) {alert("illegal maze dimensions");return;}
    var horiz =[]; for (var j= 0; j<x+1; j++) horiz[j]= [],
        verti =[]; for (var j= 0; j<x+1; j++) verti[j]= [],
        here = [Math.floor(Math.random()*x), Math.floor(Math.random()*y)],
        path = [here],
        unvisited = [];
    for (var j = 0; j<x+2; j++) {
        unvisited[j] = [];
        for (var k= 0; k<y+1; k++)
            unvisited[j].push(j>0 && j<x+1 && k>0 && (j != here[0]+1 || k != here[1]+1));
    }
    while (0<n) {
        var potential = [[here[0]+1, here[1]], [here[0],here[1]+1],
            [here[0]-1, here[1]], [here[0],here[1]-1]];
        var neighbors = [];
        for (var j = 0; j < 4; j++)
            if (unvisited[potential[j][0]+1][potential[j][1]+1])
                neighbors.push(potential[j]);
        if (neighbors.length) {
            n = n-1;
            next= neighbors[Math.floor(Math.random()*neighbors.length)];
            unvisited[next[0]+1][next[1]+1]= false;
            if (next[0] == here[0])
                horiz[next[0]][(next[1]+here[1]-1)/2]= true;
            else 
                verti[(next[0]+here[0]-1)/2][next[1]]= true;
            path.push(here = next);
        } else 
            here = path.pop();
    }
    return {x: x, y: y, horiz: horiz, verti: verti};
}

function display_maze(m) {
    var text= [];
    for (var j= 0; j<2*m.x+1; j++) {
        var line= [];
        if (0 == j%2)
            for (var k=0; k<2*m.y+1; k++)
                if (0 == k%2) 
                    line[k]= '+';
                else
                    if (j>0 && m.verti[j/2-1][Math.floor(k/2)])
                        line[k]= ' ';
                    else
                        line[k]= '-';
        else
            for (var k=0; k<2*m.y+1; k++)
                if (0 == k%2)
                    if (k>0 && m.horiz[(j-1)/2][k/2-1])
                        line[k]= ' ';
                    else
                        line[k]= '|';
                else
                    line[k]= ' ';
        // if (0 == j) line[1]= ' ';
        // if (m.x-1 == j) line[m.y]= ' ';
        if(j == 1) line[1] = 'S';
        if(j == 2*m.x-1) line[2*m.y-1] = 'E';
        text.push(line.join(''));
    }
    return text;
}
