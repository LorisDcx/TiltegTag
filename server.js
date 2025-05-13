const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Configuration du serveur
app.use(express.static('public'));

const players = {};
let eliminationOrder = []; // [{id, pseudo}]
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
let bombCarrier = null;
let bombTimer = null;
let invinciblePlayers = {};

// Gestion des connexions Socket.io
const TICK_RATE = 60; // 60 FPS
const SPEED = 200 / TICK_RATE; // Pixels par tick
const playerDirections = {};

// Boucle serveur pour mettre à jour les positions
setInterval(() => {
    for (const id in players) {
        const dir = playerDirections[id] || {dx: 0, dy: 0};
        if (dir.dx !== 0 || dir.dy !== 0) {
            // Normalisation
            let len = Math.sqrt(dir.dx * dir.dx + dir.dy * dir.dy);
            let ndx = len ? dir.dx / len : 0;
            let ndy = len ? dir.dy / len : 0;
            players[id].x += ndx * SPEED;
            players[id].y += ndy * SPEED;
            // Contrainte aux bords de l'arène (800x600)
            players[id].x = Math.max(0, Math.min(800, players[id].x));
            players[id].y = Math.max(0, Math.min(600, players[id].y));
            // Broadcast
            io.emit('playerMoved', {
                id: id,
                x: players[id].x,
                y: players[id].y
            });
        }
    }
}, 1000 / TICK_RATE);

io.on('connection', (socket) => {
    console.log(`Nouveau joueur connecté: ${socket.id}`);
    
    // Créer un nouveau joueur
    players[socket.id] = {
        x: 400,
        y: 300,
        color: colors[Math.floor(Math.random() * colors.length)],
        pseudo: `Joueur_${Math.floor(Math.random() * 1000)}`,
        hasBomb: false
    };
    
    // Attribuer la bombe si c'est le premier joueur
    if (Object.keys(players).length === 1) {
        assignBomb(socket.id);
    }
    
    // Envoyer les joueurs existants
    socket.emit('currentPlayers', players);
    
    // Prévenir les autres joueurs
    socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] });
    
    // Gestion des mouvements
    socket.on('playerDirection', (movementData) => {
        playerDirections[socket.id] = movementData;
    });
    
    // Gestion des collisions
    socket.on('playerCollision', (targetId) => {
        if (socket.id === bombCarrier && 
            !invinciblePlayers[socket.id] && 
            !invinciblePlayers[targetId] &&
            players[targetId]) {
            
            // Activer l'invincibilité
            invinciblePlayers[socket.id] = true;
            invinciblePlayers[targetId] = true;
            setTimeout(() => {
                delete invinciblePlayers[socket.id];
                delete invinciblePlayers[targetId];
            }, 1000);
            
            // Transférer la bombe
            clearTimeout(bombTimer);
            assignBomb(targetId);
        }
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`Joueur déconnecté: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

function assignBomb(playerId) {
    // Vérifier que l'ancien porteur existe encore
    if (bombCarrier && players[bombCarrier]) {
        players[bombCarrier].hasBomb = false;
        io.to(bombCarrier).emit('bombStatus', false);
    }
    
    // Vérifier que le nouveau porteur existe
    if (!players[playerId]) return;
    
    bombCarrier = playerId;
    players[playerId].hasBomb = true;
    io.emit('newBombCarrier', playerId);
    
    // Timer de 10 secondes
    clearTimeout(bombTimer);
    bombTimer = setTimeout(() => {
        explodeBomb();
    }, 10000);
}

function explodeBomb() {
    // Ajout: mémorise l'ordre d'élimination
    if (bombCarrier && players[bombCarrier]) {
        eliminationOrder.push({id: bombCarrier, pseudo: players[bombCarrier].pseudo});
    }
    if (bombCarrier) {
        // Retirer le joueur
        io.to(bombCarrier).emit('playerExploded');
        delete players[bombCarrier];
        io.emit('playerDisconnected', bombCarrier);
        
        // Attribuer la bombe à un autre joueur
        const remainingPlayers = Object.keys(players);
        if (remainingPlayers.length > 1) {
            assignBomb(remainingPlayers[Math.floor(Math.random() * remainingPlayers.length)]);
        } else if (remainingPlayers.length === 1) {
            // Fin de partie
            const winnerId = remainingPlayers[0];
            eliminationOrder.unshift({id: winnerId, pseudo: players[winnerId].pseudo});
            console.log('Envoi de gameOver à tous', eliminationOrder);
            io.emit('gameOver', eliminationOrder);
            // Reset pour la prochaine partie
            eliminationOrder = [];
            bombCarrier = null;
        } else {
            bombCarrier = null;
        }
    }
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Serveur en écoute sur le port ${PORT}`);
});
