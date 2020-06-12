const SBC = this.SBC || {};

class statBlockConverterInitializer {
    constructor() {
        /*  --------------------------------------  */
        /*            Global settings               */
        /*  --------------------------------------  */
        this.DEBUG = true; // Enable to see logs
    }
    
    
    
    if (this.DEBUG) console.log('Initializing SBC.');


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
            if (this.DEBUG) console.log("HOOK RENDER ACTOR DIRECTORY");
            const importButton = $('<button  style="min-width: 96%; margin: 10px 6px;">Import Statblock</button>');
            html.find(".directory-footer").append(importButton);
            importButton.click((ev) => {
                //SBC.playlistImporter.playlistDirectoryInterface();
                if (this.DEBUG) console.log("CLICK!");
            });
        });
    }
    
}

statBlockConverterInitializer.initalize();
