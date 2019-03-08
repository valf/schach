module.exports = {
    mode: "development",
    entry: "./chess.ts",
    module: {
        rules: [
            {
                test: /\.ts/,
                use: {
                    loader: "ts-loader",
                    options: {
                        transpileOnly: true
                    }
                }
            }
        ]
    },
}
