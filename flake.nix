{
  description = "Minerva learning platform - prototyping";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";
  };

  outputs = { self, nixpkgs }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {

      devShells.${system}.default = import ./shell.nix {inherit pkgs;};
      formatter.${system} = pkgs.alejandra;
  };
}
