use std::{io::Cursor, sync::Mutex};

use image::{ImageFormat, ImageReader};
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
struct ImageState {
    og_image: Option<Vec<u8>>,
    edit_image: Option<Vec<u8>>,
}

#[tauri::command]
fn import_image(image_data: Vec<u8>, state: State<'_, Mutex<ImageState>>) -> Option<Vec<u8>> {
    let mut state = state.lock().unwrap();
    state.og_image = Some(image_data.clone());
    state.edit_image = Some(image_data);
    state.og_image.clone()
}

#[tauri::command]
fn get_image(state: State<'_, Mutex<ImageState>>) -> ImageState {
    let state = state.lock().unwrap();
    state.clone()
}

#[derive(Deserialize, Debug)]
pub struct ManipulationParams {
    pub resize: Option<(u32, u32)>,         // (width, height)
    pub crop: Option<(u32, u32, u32, u32)>, // (x, y, width, height)
    pub grayscale: Option<bool>,            // Convert to grayscale
    pub invert: Option<bool>,               // Invert colors
}

#[tauri::command]
async fn edit_image(
    params: ManipulationParams,
    state: State<'_, Mutex<ImageState>>,
) -> Result<Vec<u8>, String> {
    let mut state = state.lock().unwrap();

    if state.edit_image.is_none() || state.og_image.is_none() {
        return Ok(Vec::<u8>::new());
    }

    let mut img = image::load_from_memory(&state.clone().og_image.unwrap())
        .map_err(|err| format!("Failed to load image: {}", err))?;

    if let Some((width, height)) = params.resize {
        img = img.resize(width, height, image::imageops::FilterType::Gaussian)
    }

    if let Some((x, y, width, height)) = params.crop {
        img = img.crop_imm(x, y, width, height);
    }

    if params.grayscale.unwrap_or(false) {
        img = img.grayscale();
    }

    if params.grayscale.unwrap_or(false) {
        img = img.grayscale();
    }

    let mut output = Cursor::new(Vec::<u8>::new());
    let _ = img
        .write_to(&mut output, ImageFormat::Png)
        .map_err(|err| format!("failed to write image: {}", err))?;

    state.edit_image = Some(output.clone().into_inner());
    Ok(output.into_inner())
}

#[tauri::command]
async fn save_image(
    path: Option<String>,
    state: State<'_, Mutex<ImageState>>,
) -> Result<(), String> {
    let state = state.lock().unwrap();

    if state.edit_image.is_none() || state.og_image.is_none() {
        return Ok(());
    }

    let img = image::load_from_memory(&state.clone().edit_image.unwrap())
        .map_err(|err| format!("Failed to load image: {}", err))?;

    if path.is_none() {
        return Ok(());
    }
    img.save(path.unwrap()).expect("Unable to Save image");

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            app.manage(Mutex::new(ImageState::default()));
            Ok(())
        })
        //.manage(ImageState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            import_image,
            get_image,
            edit_image,
            save_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
