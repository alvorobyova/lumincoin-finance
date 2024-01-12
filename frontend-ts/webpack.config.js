const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/app.ts",
  mode: "development",
  devtool: "inline-source-map",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devServer: {
    static: ".dist",
    compress: true,
    port: 9000,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new CopyPlugin({
      patterns: [
        { from: "templates", to: "templates" },
        { from: "css", to: "css" },
        {
          from: "node_modules/bootstrap/dist/css/bootstrap.min.css",
          to: "css/bootstrap.min.css",
        },
        { from: "static/fonts", to: "fonts" },
        { from: "static/images", to: "img" },
      ],
    }),
  ],
};
