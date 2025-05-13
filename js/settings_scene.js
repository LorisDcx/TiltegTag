class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }
    create() {
        this.add.text(400, 60, 'Paramètres', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        // Volume
        let volume = localStorage.getItem('tiltedtag_volume') !== 'off';
        let volBtn = this.add.text(400, 150, 'Volume: ' + (volume ? 'ON' : 'OFF'), { fontSize: '32px', fill: volume ? '#0f0' : '#f00', backgroundColor: '#222', padding: { left: 20, right: 20, top: 8, bottom: 8 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        volBtn.on('pointerdown', () => {
            volume = !volume;
            localStorage.setItem('tiltedtag_volume', volume ? 'on' : 'off');
            volBtn.setText('Volume: ' + (volume ? 'ON' : 'OFF'));
            volBtn.setStyle({ fill: volume ? '#0f0' : '#f00' });
        });
        // Pseudo
        this.add.text(400, 230, 'Pseudo:', { fontSize: '28px', fill: '#fff' }).setOrigin(0.5);
        let pseudo = localStorage.getItem('tiltedtag_pseudo') || 'Joueur';
        let pseudoBtn = this.add.text(400, 270, pseudo, { fontSize: '28px', fill: '#ffe066', backgroundColor: '#222', padding: { left: 16, right: 16, top: 6, bottom: 6 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        pseudoBtn.on('pointerdown', () => {
            let val = prompt('Entrez votre pseudo :', pseudo);
            if (val && val.trim().length > 0) {
                pseudo = val.trim();
                localStorage.setItem('tiltedtag_pseudo', pseudo);
                pseudoBtn.setText(pseudo);
            }
        });
        // Mode performance
        let perf = localStorage.getItem('tiltedtag_performance') === 'on';
        let perfBtn = this.add.text(400, 380, 'Mode performance: ' + (perf ? 'ON' : 'OFF'), { fontSize: '28px', fill: perf ? '#0f0' : '#f00', backgroundColor: '#222', padding: { left: 20, right: 20, top: 8, bottom: 8 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        perfBtn.on('pointerdown', () => {
            perf = !perf;
            localStorage.setItem('tiltedtag_performance', perf ? 'on' : 'off');
            perfBtn.setText('Mode performance: ' + (perf ? 'ON' : 'OFF'));
            perfBtn.setStyle({ fill: perf ? '#0f0' : '#f00' });
        });
        // Retour menu
        const backButton = this.add.text(400, 480, 'Retour menu', { fontSize: '32px', fill: '#fff', backgroundColor: '#900', padding: { left: 20, right: 20, top: 12, bottom: 12 } })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

// Ajout de la scène à Phaser si ce n'est pas déjà fait
if (window.Phaser && window.Phaser.GAMES && window.Phaser.GAMES.length > 0) {
    let game = window.Phaser.GAMES[0];
    if (game.scene && !game.scene.keys['SettingsScene']) {
        game.scene.add('SettingsScene', SettingsScene, false);
    }
}
