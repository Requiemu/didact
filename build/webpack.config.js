const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Mock Api 
// TODO: load all file in src/mock
const STUBS = {
  test: require('../src/mock/test.json'),
}

var mockApi = (req, res) => {
  const matchingStub = Object.keys(STUBS).find(url => req.originalUrl.includes(url));
  if (matchingStub) {
    return res.json(STUBS[matchingStub]);
  }

  return res.json({});
}

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', { pragma: 'Didact.createElement' }]]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader',
        ]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: './dist',
    compress: true,
    port: 9123,
    open: true,
    proxy: [
      {
        context: ['/api'], //add more here if you want
        secure: false,
        changeOrigin: true,
        bypass: mockApi
      },
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: 'src/index.html'
  })]
};


