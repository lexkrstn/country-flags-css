# country-flags-css

Stylesheets with individual countries' flags and their spritesheets.

We're using the icon set from [Go Squared Ltd.](http://www.gosquared.com/) in
this project. For short it's free for use, change and distribute (for more info
see the license file).

## Installing

Via NPM:
```bash
npm i -S country-flags-css
```

## How to use it

### With webpack

First of all you should configure `module.rules`, so that all the
css dependecies required in your code should be placed in a single css bundle.
An example of such config:
```js
{
	test: /\.css$/,
	use: ExtractTextPlugin.extract({
		fallback: { loader: 'style-loader', options: { sourceMap: true } },
		use: [
			{ 
				loader: 'css-loader',
				options: {
					// how many loaders before css-loader should be
					// applied to @imported resources
					importLoaders: 1,
					sourceMap: true,
					minimize: true
				}
			},
			{ loader: 'postcss-loader', options: { sourceMap: true } }
		]
	})
},
{
	test: /\.scss$/,
	use: ExtractTextPlugin.extract({
		fallback: { loader: 'style-loader', options: { sourceMap: true } },
		use: [
			{ 
				loader: 'css-loader',
				options: {
					// how many loaders before css-loader should be
					// applied to @imported resources
					importLoaders: 2,
					sourceMap: true,
					minimize: true
				}
			},
			{ loader: 'postcss-loader', options: { sourceMap: true } },
			{ loader: 'sass-loader', options: { sourceMap: true } }
		]
	})
},
/**
 * File loader for supporting images, for example, in CSS files.
 */
{
	test: /\.(jpg|png|gif)$/,
	use: [{
		loader: 'url-loader',
		options: {
			name: '[name]-[hash].[ext]',
			limit: 4096,
			outputPath: '../images/'
		}
	}]
},
```
Then you just import `country-flags-css/dist/<CSS FILE YOU NEED>` from your
`.jsx?` or `.scss` code.

## Stylesheets you can import:

- `all.css` - css classes for icons of all sizes and styles.
- `flat.css` - css classes for icons of all sizes only flatly looking flags.
- `shiny.css` - css classes for icons of all sizes only 3d looking flags.
- `(flat|shiny)(16|24|32|48|64).css` (e.g. `flat16.css`) - 16x16px flat flags.

## CSS classes

Example:
```html
<i class="cf-16 cf-af"></i>
```
The classes denotes icon size and country code in
[ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
format respectively.

Note: `cf` is an abbreviation of "Country Flag".