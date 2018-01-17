const path = require('path');
const webpack = require('webpack');
const extractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const optimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const SpritesmithPlugin = require('webpack-spritesmith');
const ImageminPlugin  = require('imagemin-webpack-plugin').default;
const CopyWebpackPlugin  = require('copy-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const HtmlWepackPlugin = require('html-webpack-plugin');

let plugins = [];

plugins.push(new BrowserSyncPlugin({
    host: 'localhost',
    port: 3000,
    files: ['./assets/**', './*.php', './*.html'],
    proxy: 'http://localhost/webpack-boilerplate/' // endereço de dev local
}));


plugins.push(new extractTextPlugin('styles/styles.css', {
    allChunks: true
}));

plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    filename: 'vendor.bundle.js'
}));

plugins.push(new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    Popper: ['popper.js', 'default']
}));

plugins.push(new SpritesmithPlugin({
    src: {
        cwd: path.resolve(__dirname, '../images/icons'),
        glob: '*.png',
    },
    target: {
        image: path.resolve(__dirname, '../images/sprite.png'),
        css: path.resolve(__dirname, '../styles/common/_sprite.scss'),
    },
    apiOptions: {
        cssImageRef: "/assets/images/sprite.png",
    },

}));

let SERVICE_URL = JSON.stringify('http://localhost:3000');


if (process.env.NODE_ENV === 'production') {

    let SERVICE_URL = JSON.stringify('http://url-de-producao');

    plugins.push(new webpack.optimize.ModuleConcatenationPlugin());

    plugins.push(new UglifyJsPlugin({
        uglifyOptions: {
            ecma: 8,
            output: {
                comments: false,
                beautify: false,
            },
            warnings: true
        }
    }));

    plugins.push(new optimizeCSSAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorOptions: {
            discardComments: {
                removeAll: true
            }
        },
        canPrint: true
    }));

    plugins.push(new HtmlWepackPlugin({
        hash: true,
        minify: {
            html5: true,
            collapseWhitespace: false,
            removeComments: true
        },
        filename: '../generated.html',
        template: './manifest.html'
    }));

}

plugins.push(new webpack.DefinePlugin({ SERVICE_URL }));

plugins.push(new CopyWebpackPlugin([{
    from: 'assets/images/',
    to: 'images/'
}]));

plugins.push(new ImageminPlugin({
    disable: process.env.NODE_ENV !== 'production',
    pngquant: {
        quality: '95-100'
    },
    optipng: {
        optimizationLevel: 9
    },
    jpegtran: { progressive: true }
}));


module.exports = {
    entry: {
        app: './assets/build/app.js',
        vendor: ['jquery', 'bootstrap', 'reflect-metadata']
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist'),
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: "css-loader"
                    }, {
                        loader: 'postcss-loader',
                        options: {
                            plugins: function () {
                                return [
                                    require('precss'),
                                    require('autoprefixer')
                                ];
                            }
                        }
                    }, {
                        loader: 'sass-loader'
                    }],
                }),
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: require.resolve('jquery'),
                use: [
                    {
                        loader: 'expose-loader',
                        query: 'jQuery',
                    },
                    {
                        loader: 'expose-loader',
                        query: '$',
                    },
                ]
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.css$/,
                use: extractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })

            },
            {
                test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'file-loader'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: 'url-loader?limit=10000&mimetype=image/svg+xml'
            },
            {
                test: /\.(png|jpeg|jpg)$/,
                loader: 'url-loader?limit=100000'
            },
            {
                test: /\.(png|jpeg|jpg)$/,
                loader: 'url-loader?limit=100000'
            }
        ]
    },
    plugins,
    devtool: "source-map"
};