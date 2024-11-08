{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-24.05.tar.gz") {} }: 

with pkgs;
mkShell {
  buildInputs = [
    jq
    htmlq
    bubblewrap

    emmet-ls
    tailwindcss-language-server

    quick-lint-js

    pnpm
    nodejs-slim
    nodePackages.typescript-language-server 
    nodePackages.vscode-langservers-extracted
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';
}
