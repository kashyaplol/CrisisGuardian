{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
  ];
  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };

  # Set environment variables for your application.
  # You can access these variables in your code using process.env.YOUR_VARIABLE_NAME.
  env = {
    API_KEY = "AIzaSyA07yRQKcCvUWJ0iNgGL6DqIxI2njrSh28";
  };
}