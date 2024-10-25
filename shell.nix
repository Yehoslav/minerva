{ pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/nixos-24.05.tar.gz") {} }: 

with pkgs;
mkShell {
  buildInputs = [
    jq
    htmlq

    emmet-ls
    nodejs-slim
    tailwindcss-language-server
    pnpm

    nodePackages.typescript-language-server 
    nodePackages.vscode-langservers-extracted
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin/:$PATH"
  '';
}
