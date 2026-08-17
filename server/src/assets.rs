use axum::{
    http::{header, StatusCode, Uri},
    response::{IntoResponse, Response},
};
use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "../dist/"]
struct Assets;

pub async fn serve_spa(uri: Uri) -> Response {
    let path = uri.path().trim_start_matches('/');

    if let Some(file) = Assets::get(path) {
        return serve_file(path, file.data);
    }

    match Assets::get("index.html") {
        Some(file) => serve_file("index.html", file.data),
        None => (StatusCode::NOT_FOUND, "not found").into_response(),
    }
}

fn serve_file(path: &str, data: std::borrow::Cow<'static, [u8]>) -> Response {
    let mime = mime_guess::from_path(path).first_or_octet_stream();
    ([(header::CONTENT_TYPE, mime.as_ref())], data.into_owned()).into_response()
}
