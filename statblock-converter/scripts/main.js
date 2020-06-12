console.log("Hello World! This code runs immediately when the file is loaded.");

Hooks.on("init", function() {
  console.log("This code runs once the Foundry VTT software begins it's initialization workflow.");
});

Hooks.on("ready", function() {
  console.log("This code runs once core initialization is ready and game data is available.");
});

const SBC = this.SBC || {};

class statBlockConverterInitializer {
    constructor() {}

    static initalize() {
        statBlockConverterInitializer.hookReady();
        statBlockConverterInitializer.hookRenderPlaylistDirectory();
        statBlockConverterInitializer.hookRenderSettings();
    }

    static hookRenderSBCButton() {
        /**
         * Appends a button onto the actor directory to open the modal dialog.
         */

        Hooks.on("renderActorDirectory", (app, html, data) => {
            const importButton = $('<button  style="min-width: 96%; margin: 10px 6px;">Import Statblock</button>');
            html.find(".directory-footer").append(importButton);
            importButton.click((ev) => {
                //SBC.playlistImporter.playlistDirectoryInterface();
                console.log("CLICK!");
            });
        });
    }
    
}

statBlockConverterInitializer.initalize();
