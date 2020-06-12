const SBC = this.SBC || {};

class statBlockConverterInitializer {
    constructor() {
        /*  --------------------------------------  */
        /*            Global settings               */
        /*  --------------------------------------  */
        //this.DEBUG = true; // Enable to see logs
    }
    
    
    
    


    static initalize() {
        console.log('Initializing SBC.');
        //statBlockConverterInitializer.hookReady();
        statBlockConverterInitializer.hookRenderSBCButton();
        //statBlockConverterInitializer.hookRenderSettings();
    }

    static hookRenderSBCButton() {
        /**
         * Appends a button onto the actor directory to open the modal dialog.
         */

        Hooks.on("renderActorDirectory", (app, html, data) => {
            console.log("HOOK RENDER ACTOR DIRECTORY");
            const importButton = $('<button class="create-entity sbc-button"><i class="fas fa-user"></i>Import Statblock</button>');
            html.find(".directory-footer").append(importButton);
            importButton.click((ev) => {
                //SBC.playlistImporter.playlistDirectoryInterface();
                console.log("CLICK!");
                statBlockConverterModalDialog.openModalDialog();
            });
        });
    }
    
}

class statBlockConverterModalDialog {
    constructor() {}
    
    static openModalDialog() {
        const options = {
            width: 500,
            height: 400
        };
        
        const content = "<p>Enter the StatBlock you want to import and convert</p><textarea id='input' class='statBlockInput'></textarea>";
        
        let d = new Dialog({
            title: "PF1 StatBlock Converter",
            content: content,
            buttons: {
                import: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Import",
                    callback: () => console.log("Chose One")
                }
            },
            default: "import",
            
            close: () => console.log("This always is logged no matter which option is chosen")
        }, options);
        d.render(true);
    }
}

statBlockConverterInitializer.initalize();
