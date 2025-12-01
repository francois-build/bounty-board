{ pkgs, ... }: {
  channel = "stable-24.05"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.firebase-tools
    pkgs.jdk17 # <--- ADDED
  ];
  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev:admin" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        "npm-install" = "npm install";
        # Installs dependencies and links workspaces
        "install-deps" = "bash fix_dependencies.sh"; # <--- ADDED
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Start Firebase emulators in the background
        # "emulators" = "firebase emulators:start";
      };
    };
  };
}
