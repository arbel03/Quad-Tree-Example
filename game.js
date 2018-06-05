/* MIT License

Copyright (c) 2018 Arbel Israeli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software. */

let ctx = null;
let players = [];
let dt = 1000/60; // Update 60 times a second.

function initialize() {
    canvas = document.getElementById("ctx");
    ctx = canvas.getContext("2d");

    // Create 20 players in a diagonal line with random sizes.
    // Velocities are being generated in `Player.constructor`.
    for (let i = 0; i < 20; i++) {
        players.push(new Player(i, i * 50, i * 50, Math.random() * 50 + 10));
    }

    // Start game loop.
    gameloop();
    setInterval(gameloop, dt);
}

function gameloop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick();
    render();
    // Generate & display the tree.
    let tree = buildTree(players, new Rect(0, 0, canvas.width, canvas.height), 0);
    display_tree(tree);
    // TODO: Add collision checking here.
}

function tick() {
    // Update players' locations.
    for (let player of players) {
        player.x += player.vel_x * dt/1000;
        player.y += player.vel_y * dt/1000;
    }
}

function render() {
    // Draw players.
    for (let player of players) {
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function display_tree(tree) {
    let rect = tree.rect;
    // Draw the current node in the tree.
    ctx.beginPath();
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    // If it has players in it draw the amount of players in the upper left corner.
    if (tree.value) {
        var nodes_count = tree.value.length.toString();
        ctx.strokeText(nodes_count, rect.x+5, rect.y+10, 10);
    }
    // If it has child nodes, repeat recursively.
    if (tree.nodes) {
        for (let child_node of tree.nodes) {
            if (child_node) {
                display_tree(child_node);
            }
        }
    }
}

function get_nodes_in_rect(players, rect) {
    // This function returns a list of players in a given rect.
    var nodes = [];
    for (let player of players) {
        if ((player.x >= rect.x) && (player.y >= rect.y) && (player.x <= (rect.x+rect.w)) && (player.y <= (rect.y+rect.h))) {
            nodes.push(player);
        }
    }
    return nodes;
}

function buildTree(players, rect, level) {
    // If there are no players in the current rect return null.
    if (players.length == 0) {
        return null;
    } else if (level >= 4 || players.length <= 2) {
        // Play with these values to see how they affect the algorithm.
        return new TreeNode(null, players, rect);
    }
    
    // Dividing the current rect into smaller ones.
    let rect1 = new Rect(rect.x, rect.y, rect.w/2, rect.h/2);
    let rect2 = new Rect(rect.x+rect.w/2, rect.y, rect.w/2, rect.h/2);
    let rect3 = new Rect(rect.x, rect.y+rect.h/2, rect.w/2, rect.h/2);
    let rect4 = new Rect(rect.x+rect.w/2, rect.y+rect.h/2, rect.w/2, rect.h/2);
    var child_nodes = [];
    for (let inner_rect of [rect1, rect2, rect3, rect4]) {
        // Sorting players per each rect and recursing the algorithm to build child nodes for the tree.
        var players_in_rect = get_nodes_in_rect(players, inner_rect);
        child_nodes.push(buildTree(players_in_rect, inner_rect, level+1));
    }
    return new TreeNode(child_nodes, null, rect);
}

class Rect {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class TreeNode {
    constructor(nodes, value, rect) {
        // Child nodes (4 nodes since its a quad tree)
        this.nodes = nodes;
        // Value of each node (A list of players that are currently inside its rect)
        this.value = value;
        // The rectangle of the current node.
        // Now when I look on it, the rect data should go inside `this.value` variable as well.
        this.rect = rect;
    }
}

class Player {
    constructor(id, x, y, size) {
        this.id = id;
        this.x = x;
        this.y = y;
        // Radius
        this.size = size;
        // Generating random velocities.
        this.vel_x = Math.random() * 300 - 150;
        this.vel_y = Math.random() * 300 - 150;
        // Player color.
        this.color = '#000000';
    }
}
