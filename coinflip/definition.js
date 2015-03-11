module.exports = function() {

  var playerRole = {
    actions: {
      choose: {
        isAvailable: function(player) {
          return player.room.currentStage === "choose";
        },
        type: "select",
        options: {
          choices: ["Head", "Tail"],
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
    name: "Coin-Flipping",
    description: "A simple implementation of Coin-Flipping !",
    minPlayers: 2,
    maxPlayers: 5,
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

          // Flip the coin
          var result;
          if (Math.random() >= 0.5) {
            result = "Head";
          } else {
            result = "Tail";
          }
          room.message("Coin result: "+result);

          // List the winners
          var winnersList = "";
          var winnersNumber = 0;

          room.players.forEach(function(e) {
            if (e.player.choice === result) {
              if (winnersNumber != 0) {
                winnersList+= ", ";
              }

              winnersList += e.username;
              winnersNumber++;
            }
          });

          // Annonce the winners
          switch(winnersNumber) {
            case 0:
              room.message("There is no winner...!");
              break;
            case 1:
              room.message(winnersList + " won!");
              break;
            default:
              room.message("And the winners are... "+winnersList+"!");
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
      room.broadcast("setGameInfo", "Coin Flipping Simulation");
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
