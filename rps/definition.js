module.exports = function() {

    var playerRole = {
        actions: {
            choose: {
                isAvailable: function(room) {
                    return room.currentStage === "choose";
                },
                type: "select",
                options: {
                    choices: ["Rock", "Paper", "Scissors"],
                    submit: "Choose",
                },
                execute: function(player, choice) {
                    player.emit("chatMessage", {message: "You have selected <strong>" + choice + "</strong>" });
                    player.choice = choice;
                    if(player.room.players.every(function(p) { return p.player.choice !== null; })) {
                        player.room.endStage();
                    }
                }
            }
        },
        channels: {}
    };


    return {
        name: "Rock-Paper-Scissors",
        description: "A simple implementation of Rock-Paper-Scissors against an other player!",
        minPlayers: 2,
        maxPlayers: 2,
        parameters: [],
        firstStage: "warmup",
        stages: {
            "warmup": {
                start: function(room, callback) {
                    callback(null, 2);
                },
                end: function(room, callback) {
                    room.nextStage("choose");
                }
            },
            "choose": {
                start: function(room, callback) {
                    room.players.forEach(function(e) {
                        e.player.choice = null;
                    });
                    room.broadcast("chatMessage", {message: "<strong>Do your choice !</strong>"});
                    callback(null, 20);
                },
                end: function(room, callback) {
                    room.broadcast("clearChat");
                    room.nextStage("announce");
                }
            },
            "announce": {
                start: function(room, callback) {

                    var aChoice = room.players[0].player.choice;
                    var bChoice = room.players[1].player.choice;

                    var score = 1;
                    
                    if(aChoice === "Rock"     && bChoice === "Scissors" ||
                       aChoice === "Paper"    && bChoice === "Rock"     ||
                       aChoice === "Scissors" && bChoice === "Paper")
                        score = -1;

                    if(aChoice === bChoice)
                        score = 0;

                    room.message(room.players[0].username + " has chosen <strong>" + aChoice + "</strong> and " + 
                                 room.players[1].username + " has chosen <strong>" + bChoice + "</strong>.");

                    switch(score) {
                        case -1:
                            room.message(room.players[0].username + " won!");
                            room.players[0].player.score++;
                            break;
                        case 1:
                            room.message(room.players[1].username + " won!");
                            room.players[1].player.score++;
                            break;
                    }

                    callback(null, 5);
                },
                end: function(room, callback) {
                    room.message("<hr />");
                    room.nextStage("choose");
                }
            },
            "end": {
                start: function(room, callback) {
                    callback(null, -1);
                }
            }
        },

        init: function() {},

        start: function(room, callback) {

            this.room = room;

            for(i = 0; i < room.players.length; i++) {
                room.players[i].player.setRole("player", playerRole);
            }
            callback(null);
            room.broadcast("setGameInfo", "Rock-Paper-Scissors Simulation");
            room.broadcast("chatMessage", {message: "<strong>Are you ready ?</strong>" });
        },

        processMessage: function(channel, message, player) {
            return message;
        },

        onDisconnect: function(room, player) {
            room.nextStage("end");
        }
    }
};