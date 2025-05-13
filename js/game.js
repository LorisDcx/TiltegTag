// Fonctions utilitaires pour les pièces
function getCoins() {
    return parseInt(localStorage.getItem('tiltedtag_coins') || '0', 10);
}
function addCoins(amount) {
    let coins = getCoins() + amount;
    localStorage.setItem('tiltedtag_coins', coins);
    // Mettre à jour l'affichage dans le menu si présent
    let menuScene = null;
    if (window.Phaser && window.Phaser.GAMES && window.Phaser.GAMES.length > 0) {
        for (let g of window.Phaser.GAMES) {
            if (g && g.scene && g.scene.keys && g.scene.keys['MenuScene']) {
                menuScene = g.scene.keys['MenuScene'];
                if (menuScene.refreshCoins) menuScene.refreshCoins();
            }
        }
    }
    return coins;
}

// Fonctions utilitaires pour la pub
function canWatchAd() {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = localStorage.getItem('tiltedtag_ads_date') || '';
    let count = parseInt(localStorage.getItem('tiltedtag_ads_count') || '0', 10);
    if (lastDate !== today) {
        count = 0;
        localStorage.setItem('tiltedtag_ads_date', today);
        localStorage.setItem('tiltedtag_ads_count', '0');
    }
    return count < 2;
}
function incrementAdCount() {
    const today = new Date().toISOString().slice(0, 10);
    let count = parseInt(localStorage.getItem('tiltedtag_ads_count') || '0', 10);
    localStorage.setItem('tiltedtag_ads_date', today);
    localStorage.setItem('tiltedtag_ads_count', (count + 1).toString());
}

// Définition des scènes d'abord
class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // Affichage des pièces
        let coins = getCoins();
        this.coinsText = this.add.text(30, 30, `💰 ${coins}`, { fontSize: '32px', fill: '#ffe066', fontStyle: 'bold', backgroundColor: '#222' })
            .setOrigin(0, 0).setDepth(100);

        // Ajout du titre
        this.add.text(400, 200, 'Tilted Tag', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
        
        // Bouton pour commencer
        const startButton = this.add.text(400, 350, 'Commencer', { fontSize: '32px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive();
        
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Bouton pour ouvrir la boutique
        const shopButton = this.add.text(400, 420, 'Boutique', { fontSize: '28px', fill: '#ffe066', backgroundColor: '#444', padding: { left: 12, right: 12, top: 6, bottom: 6 } })
            .setOrigin(0.5)
            .setInteractive();
        shopButton.on('pointerdown', () => {
            this.scene.start('ShopScene');
        });

        // Bouton Mes Skins
        const mySkinsButton = this.add.text(400, 480, 'Mes Skins', { fontSize: '28px', fill: '#66f', backgroundColor: '#eee', padding: { left: 12, right: 12, top: 6, bottom: 6 } })
            .setOrigin(0.5)
            .setInteractive();
        mySkinsButton.on('pointerdown', () => {
            this.scene.start('MySkinsScene');
        });

        // Bouton Paramètres
        const settingsButton = this.add.text(400, 540, 'Paramètres', { fontSize: '28px', fill: '#222', backgroundColor: '#ccc', padding: { left: 12, right: 12, top: 6, bottom: 6 } })
            .setOrigin(0.5)
            .setInteractive();
        settingsButton.on('pointerdown', () => {
            this.scene.start('SettingsScene');
        });
    }

    // Méthode pour rafraîchir l'affichage des pièces
    refreshCoins() {
        if (this.coinsText) {
            this.coinsText.setText(`💰 ${getCoins()}`);
        }
    }
}

// Boutique minimaliste fiable
class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }
    create() {
        console.log('ShopScene minimaliste créée');
        // Affichage du solde de pièces
        this.add.text(30, 30, `💰 ${getCoins()}`, { fontSize: '32px', fill: '#ffe066', fontStyle: 'bold', backgroundColor: '#222' })
            .setOrigin(0, 0);
        this.add.text(400, 80, 'Boutique', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        // Liste simple de skins
        this.skins = [
            { id: 'skin1', type: 'personnage', name: 'Classique', price: 0 },
            { id: 'skin2', type: 'personnage', name: 'Rouge', price: 30 },
            { id: 'skin3', type: 'personnage', name: 'Bleu', price: 30 }
        ];
        let y = 180;
        for (let i = 0; i < this.skins.length; i++) {
            let skin = this.skins[i];
            let owned = this.isSkinOwned(skin.id);
            let equipped = this.isSkinEquipped(skin.type, skin.id);
            let skinText = `${skin.name} (${skin.price}💰)`;
            if (skin.price === 0) skinText = `${skin.name} (de base)`;
            this.add.text(180, y, skinText, { fontSize: '24px', fill: owned ? '#fff' : '#aaa' }).setOrigin(0, 0.5);
            let status = owned ? (equipped ? 'Équipé' : 'Acheté') : 'Non possédé';
            let statusColor = equipped ? '#0f0' : (owned ? '#ffe066' : '#888');
            this.add.text(440, y, status, { fontSize: '20px', fill: statusColor }).setOrigin(0, 0.5);
            // Bouton acheter/équiper
            let btn = null;
            if (!owned && skin.price > 0) {
                btn = this.add.text(600, y, 'Acheter', { fontSize: '20px', fill: getCoins() >= skin.price ? '#0f0' : '#888', backgroundColor: '#222', padding: { left: 8, right: 8, top: 2, bottom: 2 } })
                    .setOrigin(0, 0.5)
                    .setInteractive({ useHandCursor: true });
                if (getCoins() < skin.price) {
                    btn.setAlpha(0.5);
                    btn.disableInteractive();
                }
                btn.on('pointerdown', () => {
                    console.log('Achat demandé', skin.id);
                    if (getCoins() >= skin.price) {
                        this.buySkin(skin);
                    }
                });
            } else if (owned && !equipped) {
                btn = this.add.text(600, y, 'Équiper', { fontSize: '20px', fill: '#ffe066', backgroundColor: '#222', padding: { left: 8, right: 8, top: 2, bottom: 2 } })
                    .setOrigin(0, 0.5)
                    .setInteractive({ useHandCursor: true });
                btn.on('pointerdown', () => {
                    console.log('Équipement demandé', skin.id);
                    this.equipSkin(skin);
                });
            } else if (equipped) {
                btn = this.add.text(600, y, 'Équipé', { fontSize: '20px', fill: '#0f0', backgroundColor: '#222', padding: { left: 8, right: 8, top: 2, bottom: 2 } }).setOrigin(0, 0.5);
            }
            y += 48;
        }
        // Bouton retour menu géant
        const backButton = this.add.text(400, 500, 'Retour menu', { fontSize: '38px', fill: '#fff', backgroundColor: '#900', padding: { left: 20, right: 20, top: 12, bottom: 12 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            console.log('Retour menu cliqué');
            this.scene.start('MenuScene');
        });
    }
    isSkinOwned(skinId) {
        let owned = JSON.parse(localStorage.getItem('tiltedtag_skins_owned') || '{}');
        return !!owned[skinId];
    }
    isSkinEquipped(type, skinId) {
        let equipped = JSON.parse(localStorage.getItem('tiltedtag_skins_equipped') || '{}');
        return equipped[type] === skinId;
    }
    buySkin(skin) {
        let coins = getCoins();
        if (coins < skin.price) return;
        coins -= skin.price;
        localStorage.setItem('tiltedtag_coins', coins);
        let owned = JSON.parse(localStorage.getItem('tiltedtag_skins_owned') || '{}');
        owned[skin.id] = true;
        localStorage.setItem('tiltedtag_skins_owned', JSON.stringify(owned));
        let equipped = JSON.parse(localStorage.getItem('tiltedtag_skins_equipped') || '{}');
        if (!equipped[skin.type]) {
            equipped[skin.type] = skin.id;
            localStorage.setItem('tiltedtag_skins_equipped', JSON.stringify(equipped));
        }
        this.scene.restart();
    }
    equipSkin(skin) {
        let equipped = JSON.parse(localStorage.getItem('tiltedtag_skins_equipped') || '{}');
        equipped[skin.type] = skin.id;
        localStorage.setItem('tiltedtag_skins_equipped', JSON.stringify(equipped));
        this.scene.restart();
    }
}

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.players = {};
        this.playerNames = {};
        this.socket = null;
        this.bombIcon = null;
        this.bombCarrier = null;
        this.lastDir = {dx: 0, dy: 0};
        this.statusPanel = null;
        this.alivePlayers = {}; // {id: info}
        this.deadPlayers = {}; // {id: info}
    }

    preload() {
        this.load.image('player', 'https://labs.phaser.io/assets/sprites/phaser-dude.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d2d2d');
        this.socket = io();
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.gameOver = false;

        // Handler gameOver (affichage écran de fin)
        this.socket.on('gameOver', (order) => {
            console.log('gameOver reçu', order);
            this.gameOver = true;
            if (this.statusPanel && this.statusPanel.destroy) this.statusPanel.destroy();
            this.showGameOverScreen(order);
        });

        // Gestion des joueurs existants
        this.socket.on('currentPlayers', (players) => {
            Object.keys(players).forEach(id => {
                this.addPlayer(id, players[id], id === this.socket.id);
                this.alivePlayers[id] = players[id];
            });
            this.updateStatusPanel();
        });
        // Nouveau joueur
        this.socket.on('newPlayer', (data) => {
            this.addPlayer(data.id, data.player, data.id === this.socket.id);
            this.alivePlayers[data.id] = data.player;
            this.updateStatusPanel();
        });
        // Mouvement de tous les joueurs
        this.socket.on('playerMoved', (data) => {
            if (this.players[data.id]) {
                this.players[data.id].setPosition(data.x, data.y);
            }
        });
        // Déconnexion
        this.socket.on('playerDisconnected', (id) => {
            if (this.players[id]) {
                this.players[id].destroy();
                this.playerNames[id].destroy();
                delete this.players[id];
                delete this.playerNames[id];
            }
            delete this.alivePlayers[id];
            delete this.deadPlayers[id];
            this.updateStatusPanel();
        });
        // Bombe
        this.socket.on('bombStatus', (hasBomb) => {
            if (hasBomb && this.players[this.socket.id]) {
                this.addBombIcon(this.players[this.socket.id]);
            } else if (this.bombIcon) {
                this.bombIcon.destroy();
                this.bombIcon = null;
            }
            this.updateStatusPanel();
        });
        this.socket.on('newBombCarrier', (playerId) => {
            this.bombCarrier = playerId;
            if (this.players[playerId]) {
                this.addBombIcon(this.players[playerId]);
            }
            this.updateStatusPanel();
        });
        this.socket.on('playerExploded', () => {
            // Animation d'explosion et élimination
            const id = this.socket.id;
            if (this.players[id]) {
                const x = this.players[id].x;
                const y = this.players[id].y;
                // Animation d'explosion simple (cercle rouge qui grossit et disparaît)
                const explosion = this.add.circle(x, y, 10, 0xff0000).setDepth(10);
                this.tweens.add({
                    targets: explosion,
                    radius: 60,
                    alpha: 0,
                    duration: 800,
                    ease: 'Cubic.easeOut',
                    onComplete: () => explosion.destroy()
                });
                // Affiche "Éliminé !"
                const txt = this.add.text(x, y, 'Éliminé !', {fontSize: '32px', fill: '#fff', backgroundColor: '#900'}).setOrigin(0.5);
                this.time.delayedCall(2000, () => txt.destroy());
                // Retire le joueur et son pseudo
                this.players[id].destroy();
                this.playerNames[id].destroy();
                // Déplacement dans deadPlayers
                this.deadPlayers[id] = this.alivePlayers[id];
                delete this.alivePlayers[id];
                delete this.players[id];
                delete this.playerNames[id];
                this.updateStatusPanel();
            }
        });
    }

    updateStatusPanel() {
        // Destroy previous panel if it exists
        if (this.statusPanel && this.statusPanel.destroy) this.statusPanel.destroy();
        let y = 0;
        let panelWidth = 170;
        let panelHeight = 40 + 22 * (Object.keys(this.alivePlayers).length + Object.keys(this.deadPlayers).length + 2);
        this.statusPanel = this.add.container(10, 10);
        // Background rectangle
        let bg = this.add.rectangle(0, 0, panelWidth, panelHeight, 0x222222, 0.7).setOrigin(0, 0).setDepth(-1);
        this.statusPanel.add(bg);
        // Alive players
        let aliveTitle = this.add.text(8, y + 4, 'Joueurs en vie :', {fontSize:'18px', fill:'#fff', fontStyle:'bold'});
        this.statusPanel.add(aliveTitle); y += 24;
        Object.keys(this.alivePlayers).forEach(id => {
            let info = this.alivePlayers[id];
            let bomb = (id === this.bombCarrier) ? ' 💣' : '';
            let color = (id === this.socket.id) ? '#0f0' : '#fff';
            let t = this.add.text(12, y, info.pseudo + bomb, {fontSize:'16px', fill: color});
            this.statusPanel.add(t); y += 20;
        });
        // Dead players
        if (Object.keys(this.deadPlayers).length > 0) {
            y += 8;
            let deadTitle = this.add.text(8, y, 'Éliminés :', {fontSize:'18px', fill:'#aaa'});
            this.statusPanel.add(deadTitle); y += 24;
            Object.keys(this.deadPlayers).forEach(id => {
                let info = this.deadPlayers[id];
                let t = this.add.text(12, y, '~~' + info.pseudo + '~~', {fontSize:'16px', fill:'#888', fontStyle:'italic'});
                t.setAlpha(0.5);
                this.statusPanel.add(t); y += 20;
            });
        }
    }

    // Affichage de l'écran de fin de partie
    showGameOverScreen(order) {
        // Fond opaque
        let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8).setDepth(1000);
        // Titre
        let title = this.add.text(400, 80, 'Fin de partie', {fontSize: '48px', fill: '#fff'}).setOrigin(0.5).setDepth(1001);
        // Classement
        let y = 160;
        let myId = this.socket.id;
        let myRank = -1;
        let myReward = 1;
        for (let i = 0; i < order.length; i++) {
            let reward = 1;
            if (i === 0) reward = 10;
            else if (i === 1) reward = 5;
            else if (i === 2) reward = 3;
            let color = (i === 0) ? '#ffd700' : (i === 1) ? '#aaa' : (i === 2) ? '#cd7f32' : '#fff';
            this.add.text(220, y, `${i+1}. ${order[i].pseudo}`, {fontSize:'28px', fill: color}).setDepth(1001);
            this.add.text(600, y, `+${reward} pièce${reward>1?'s':''}`, {fontSize:'28px', fill:'#ffe066'}).setDepth(1001);
            if (order[i].id === myId) {
                myRank = i;
                myReward = reward;
            }
            y += 40;
        }
        // Créditer les pièces pour le joueur local
        addCoins(myReward);

        // Icône vidéo animée pour pub (limité à 2 fois/jour)
        let adIcon = this.add.text(370, 425, '🎬', {
            fontSize: '36px',
            fill: canWatchAd() ? '#fff' : '#888',
            backgroundColor: canWatchAd() ? '#228822' : '#888',
            padding: { left: 10, right: 10, top: 4, bottom: 4 },
            align: 'center',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1002);
        let adLabel = this.add.text(430, 425, canWatchAd() ? '+10 pièces' : 'Limite de pubs atteinte aujourd\'hui', {
            fontSize: '22px',
            fill: canWatchAd() ? '#ffe066' : '#aaa'
        }).setOrigin(0, 0.5).setDepth(1002);

        if (canWatchAd()) {
            adIcon.setInteractive({ useHandCursor: true });
            adIcon.on('pointerover', () => {
                this.tweens.add({
                    targets: adIcon,
                    scale: { from: 1, to: 1.3 },
                    yoyo: true,
                    duration: 200
                });
            });
            adIcon.on('pointerout', () => {
                this.tweens.add({
                    targets: adIcon,
                    scale: 1,
                    duration: 100
                });
            });
            adIcon.on('pointerdown', () => {
                incrementAdCount();
                addCoins(10);
                adIcon.setFill('#888');
                adIcon.setBackgroundColor('#888');
                adIcon.disableInteractive();
                adLabel.setText('Limite de pubs atteinte aujourd\'hui');
                adLabel.setFill('#aaa');
                this.add.text(400, 470, `+10 pièces ajoutées !`, {fontSize:'22px', fill:'#ffe066'}).setOrigin(0.5).setDepth(1003);
            });
        } else {
            adIcon.disableInteractive();
        }

        // Bouton rejouer
        let btn = this.add.rectangle(400, 520, 200, 60, 0x4444cc, 1).setInteractive().setDepth(1001);
        let txt = this.add.text(400, 520, 'Rejouer', {fontSize:'32px', fill:'#fff'}).setOrigin(0.5).setDepth(1002);
        btn.on('pointerdown', () => { window.location.reload(); });

        // Message d'info pour le joueur local
        if (myRank >= 0) {
            this.add.text(400, 470, `Tu gagnes +${myReward} pièce${myReward>1?'s':''} !`, {fontSize:'24px', fill:'#ffe066'}).setOrigin(0.5).setDepth(1001);
        }
    }

    addPlayer(id, info, isLocal) {
        // Détermine le skin équipé
        let equipped = JSON.parse(localStorage.getItem('tiltedtag_skins_equipped') || '{}');
        let skinId = equipped['personnage'] || 'skin1';
        let color = 0xffffff;
        if (skinId === 'skin2') color = 0xff4444;
        else if (skinId === 'skin3') color = 0x4488ff;
        const player = this.physics.add.sprite(info.x, info.y, 'player');
        player.setTint(color);
        info.color = color;
        player.setCollideWorldBounds(true);
        this.players[id] = player;
        // Pseudo
        let displayPseudo = info.pseudo;
        if (isLocal) {
            displayPseudo = localStorage.getItem('tiltedtag_pseudo') || 'Joueur';
        }
        const nameText = this.add.text(info.x, info.y - 40, displayPseudo, {
            fontSize: '16px', fill: '#fff', backgroundColor: '#000'
        }).setOrigin(0.5);
        this.playerNames[id] = nameText;
        // Couleur spéciale pour le joueur local
        if (isLocal) player.setTint(0x00ff00);
    }
    
    addBombIcon(player) {
        if (this.bombIcon) this.bombIcon.destroy();
        
        this.bombIcon = this.add.text(
            player.x, 
            player.y - 60, 
            '💣', 
            { 
                fontSize: '32px',
                backgroundColor: '#ff0000'
            }
        );
        this.bombIcon.setOrigin(0.5);
        
        // Animation de pulsation
        this.tweens.add({
            targets: this.bombIcon,
            scale: { from: 1, to: 1.3 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    update() {
        if (this.gameOver) return; // Ne rien faire si game over

        // Ne pas rafraîchir le panneau si game over
        if (!this.gameOver) this.updateStatusPanel();
        // Détection des collisions
        if (this.players[this.socket.id] && this.socket.id === this.bombCarrier) {
            Object.keys(this.players).forEach(id => {
                if (id === this.socket.id) return;
                const otherPlayer = this.players[id];
                if (Phaser.Geom.Intersects.RectangleToRectangle(
                    this.players[this.socket.id].getBounds(),
                    otherPlayer.getBounds()
                )) {
                    this.socket.emit('playerCollision', id);
                }
            });
        }
        // Mettre à jour la position de l'icône bombe
        if (this.bombIcon && this.bombCarrier && this.players[this.bombCarrier]) {
            this.bombIcon.setPosition(this.players[this.bombCarrier].x, this.players[this.bombCarrier].y - 60);
        }
        // Mettre à jour la position des pseudos
        Object.keys(this.players).forEach(id => {
            if (this.playerNames[id]) {
                this.playerNames[id].setPosition(this.players[id].x, this.players[id].y - 40);
            }
        });
        // Calcul de la direction et envoi au serveur
        let dx = 0, dy = 0;
        if (this.cursors.left.isDown || this.keyA.isDown) dx -= 1;
        if (this.cursors.right.isDown || this.keyD.isDown) dx += 1;
        if (this.cursors.up.isDown || this.keyW.isDown) dy -= 1;
        if (this.cursors.down.isDown || this.keyS.isDown) dy += 1;
        if (!this.lastDir || dx !== this.lastDir.dx || dy !== this.lastDir.dy) {
            this.lastDir = {dx, dy};
            this.socket.emit('playerDirection', this.lastDir);
        }
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super('EndScene');
    }

    create() {
        // Affichage du score et bouton retour menu
    }
}

// Configuration du jeu APRÈS la définition des scènes
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, ShopScene, MySkinsScene, SettingsScene, EndScene],
    canvasStyle: 'will-read-frequently', // Nouvelle approche pour l'attribut canvas
    dom: {
        createContainer: true
    },
    plugins: {
        scene: [
            { key: 'DOM', plugin: Phaser.DOM.Plugin, mapping: 'dom' }
        ]
    }
};

// Lancement du jeu
const game = new Phaser.Game(config);
