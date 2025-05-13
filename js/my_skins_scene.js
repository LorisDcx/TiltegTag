class MySkinsScene extends Phaser.Scene {
    constructor() {
        super('MySkinsScene');
    }
    create() {
        this.add.text(400, 60, 'Mes Skins', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        const skins = [
            { id: 'skin1', name: 'Classique', color: 0xffffff },
            { id: 'skin2', name: 'Rouge', color: 0xff4444 },
            { id: 'skin3', name: 'Bleu', color: 0x4488ff }
        ];
        let owned = JSON.parse(localStorage.getItem('tiltedtag_skins_owned') || '{}');
        let equipped = JSON.parse(localStorage.getItem('tiltedtag_skins_equipped') || '{}');
        let y = 160;
        for (let skin of skins) {
            if (!owned[skin.id]) continue;
            let isEquipped = equipped['personnage'] === skin.id;
            let label = skin.name + (isEquipped ? ' (Équipé)' : '');
            let color = isEquipped ? '#0f0' : '#fff';
            this.add.text(320, y, label, { fontSize: '28px', fill: color }).setOrigin(0, 0.5);
            let btn = null;
            if (!isEquipped) {
                btn = this.add.text(600, y, 'Équiper', { fontSize: '22px', fill: '#ffe066', backgroundColor: '#222', padding: { left: 8, right: 8, top: 2, bottom: 2 } })
                    .setOrigin(0, 0.5)
                    .setInteractive({ useHandCursor: true });
                btn.on('pointerdown', () => {
                    equipped['personnage'] = skin.id;
                    localStorage.setItem('tiltedtag_skins_equipped', JSON.stringify(equipped));
                    this.scene.restart();
                });
            } else {
                btn = this.add.text(600, y, 'Équipé', { fontSize: '22px', fill: '#0f0', backgroundColor: '#222', padding: { left: 8, right: 8, top: 2, bottom: 2 } })
                    .setOrigin(0, 0.5);
            }
            y += 60;
        }
        // Bouton retour menu
        const backButton = this.add.text(400, 520, 'Retour menu', { fontSize: '32px', fill: '#fff', backgroundColor: '#900', padding: { left: 20, right: 20, top: 12, bottom: 12 } })
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
    if (game.scene && !game.scene.keys['MySkinsScene']) {
        game.scene.add('MySkinsScene', MySkinsScene, false);
    }
}
