use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=../dist");

    if !Path::new("../dist/index.html").exists() {
        eprintln!(
            "\nerror: ../dist/index.html not found.\n\
             Run `bun run build:client` from the repo root before building the server.\n"
        );
        std::process::exit(1);
    }
}
