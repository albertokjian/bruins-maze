# Trapped!

### Installation/Set-Up
1. Clone this repository: `git clone https://github.com/intro-graphics/team-project-trapped.git`
2. Start up the server.
- If you are on Windows, double click on `host.bat`
- If you are on Mac, double click on `host.command`
- Note: On Mac, you might get a security warning instead if you double-click. Instead, right click the files, then choose Open, or you can go into System Preferences/Security & Prinvacy/General and click 'Open Anyway'. You may possibly need to check the file permissions and set them to 744.
3. Go to your browser (e.g., Chrome) and navigate to `localhost:8000`. This will get you to the local server running this repository.
`If you don't see the maze (e.g., especially if this is the first time setting up):`
4. Right click and go to "Inspect", or use Cmd+Option+I on Mac, or use F12 on Windows.
5. Navigate to the Source tab.
6. In File Explorer (Windows) or Finder (Mac), navigate to this repository folder, and drag and drop the contents (entire folder) into the Workspace under Filesystem tab (you might need to switch from Page tab to Filesystem tab). 
7. You will be prompted to be asking you for permission to modify your local files. Hit yes.
8. Refresh the page to see the project. You may need to hard reload or empty cache/hard reload. To do that, right click on the refresh button in your browser to see such additional options.

### How to Play
#### CONTROLS
- In a similar fashion as WASD, use `i` to jump, `j` to go left, and `l` to go right.
- Press `0` to view entire maze
- Press `1` to view player camera view
- Other auxiliary controls can be found in the control panel (bottom part of the screen) in the webpage.
#### OBJECTIVE
The ball spawns at some location in the maze, and you need to use the keys i, j, and l to make the ball traverse the maze to the very end.

### Code References/Libraries Used
- Maze generator: Rosetta Code https://rosettacode.org/wiki/Maze_generation
