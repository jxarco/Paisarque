var DATA = {
    
    cubemaps: [
        {src: "skybox.png",     preview: "skybox_preview.png"},
        {src: "skybox2.png",    preview: "skybox2_preview.png"},
        {src: "skybox3.png",    preview: "skybox3_preview.png"},
        {src: "skybox4.png",    preview: "skybox4_preview.png"}
    ],
    
    scripts: [
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyDrcNsufDO4FEmzoCO9X63ru59CUvCe2YI&callback=initMap'
    ],
    
    litegui: {
        
        sections: {
            data: {
                title: { "es": "Información", "cat": "Informació", "en": "Information" },
                author: { "es": "Autor", "cat": "Autor", "en": "Author" },
                loc: { "es": "Ubicación", "cat": "Ubicació", "en": "Location" },
                desc: { "es": "Decripción", "cat": "Descripció", "en": "Description" }
            },
            map: {
                title: { "es": "Mapa", "cat": "Mapa", "en": "Map" },
                lat: { "es": "Latitud", "cat": "Latitud", "en": "Latitude" },
                lng: { "es": "Longitud", "cat": "Longitud", "en": "Longitude" }
            },
            cubemaps: {
                title: { "es": "Fondo de escena", "cat": "Fons d'escena", "en": "Scene background" },
                quit: { "es": "Quitar fondo", "cat": "Treure fons", "en": "Remove background" }
            },
            general: {
                title: { "es": "General", "cat": "General", "en": "General" },
                auto_save: { "es": "Auto-guardar", "cat": "Auto-desa", "en": "Auto-save" },
                save: { "es": "Guardar", "cat": "Desa", "en": "Save" },
                fullscreen: { "es": "Pantalla completa", "cat": "Pantalla completa", "en": "Full screen" }
            },
            camera: {
                title: { "es": "Cámara", "cat": "Càmera", "en": "Camera" },
                reset: { "es": "Restablecer", "cat": "Restablir", "en": "Restore" },
                orbit: { "es": "Orbitar", "cat": "Orbitar", "en": "Orbit" }
            },
            model: {
                title: { "es": "Modelo 3D", "cat": "Model 3D", "en": "3D Model" },
                rotations: { "es": "Rotaciones", "cat": "Rotacions", "en": "Rotations" },
                config_rot: { "es": "Configurar", "cat": "Configurar", "en": "Set up" }
            },
            measures: {
                title: { "es": "Medidas", "cat": "Mesures", "en": "Measurements" },
                scale: { "es": "Escala", "cat": "Escala", "en": "Scale" },
                config_scale: { "es": "Configurar", "cat": "Configurar", "en": "Set up" },
                log: { "es": "Registro", "cat": "Registre", "en": "Log" },
                log_values: { "es": ["...","O-D","Segmentos","Áreas"], "cat": ["...","O-D","Segments","Àrees"], "en": ["...","O-D","Segments","Areas"] },
                dist: { "es": "Distancia", "cat": "Distancia", "en": "Distance" },
                create_dist: { "es": "Crear", "cat": "Crear", "en": "Create" },
                area: { "es": "Área", "cat": "Àrea", "en": "Area" },
                area_values: { "es": ["Planta","Libre"], "cat": ["Planta","Lliure"], "en": ["Top view","Free"] }
            },
            export: {
                title: { "es": "Exportar escena", "cat": "Exportar l'escena", "en": "Export scene" },
                image: { "es": "Imagen", "cat": "Imatge", "en": "Snapshot" },
                image_btn: { "es": "Capturar", "cat": "Captura", "en": "Capture" },
                record: { "es": "Grabar", "cat": "Gravar", "en": "Record" },
                record_values: { "es": ["Empezar","Parar","Exportar"], "cat": ["Comença","Atura","Exportar"], "en": ["Play","Stop","Export"] },
                name: { "es": "Nombre", "cat": "Nom", "en": "Name" },
                format: { "es": "Formato", "cat": "Format", "en": "Format" },
                quality: { "es": "Calidad", "cat": "Qualitat", "en": "Quality" }
            },
            anot_options: {
                title: { "es": "Opciones", "cat": "Opcions", "en": "Options" },
                show: { "es": "Mostrar", "cat": "Mostrar", "en": "Show" },
                anotate: { "es": "Anotar", "cat": "Anotar", "en": "Anotate" }
            }
        }
    }
};