# MTT Icon Finder

MTT Icon Finder is an Office Add-in for PowerPoint that allows users to search and insert icons into their presentations. The add-in uses Fuse.js for searching and integrates with Microsoft Authentication Library (MSAL) for user authentication.

## Features

- Search for icons by name or tags
- Insert icons into PowerPoint slides
- Supports both PNG and SVG icons
- User authentication with MSAL

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/OfficeDev/Office-Addin-TaskPane.git
   cd Office-Addin-TaskPane
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Generate self-signed certificates for HTTPS:
   ```sh
   npx office-addin-dev-certs install
   ```

4. Start the development server:
   ```sh
   npm run start:desktop:powerpoint
   ```

5. Sideload the add-in into PowerPoint:
   - Open PowerPoint
   - Go to `Insert` > `My Add-ins` > `Manage My Add-ins` > `Upload My Add-in`
   - Select the `manifest.xml` file from the `dist` folder

## Configuration

### MSAL Configuration

Update the MSAL configuration in `src/taskpane/taskpane.ts` with your Azure AD app details:

```typescript
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID",
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID",
    redirectUri: "https://localhost:3000/taskpane.html",
  },
};
```

### Webpack Configuration

Update the production URL in `webpack.config.js`:

```javascript
const urlProd = "https://mttsolutions.sharepoint.com/:f:/s/MTTPublic/Ek75q96zzZxDnFRIoIVIZYgBh59xSX6bPOQBoZZQ665n0Q/";
```

## Usage

1. Open PowerPoint and load the MTT Icon Finder add-in.
2. Use the search box to find icons by name or tags.
3. Click on an icon to insert it into the current slide.

## Adding Icons

To add new icons to the MTT Icon Finder:

1. Place the icon files (PNG or SVG) in the `assets` or `assets/sap` directory.
2. Update the `assets/icons.json` file to include the new icons. Each icon entry should have a `name`, `url`, and `tags`. For example:

```json
{
  "name": "NewIcon",
  "url": "assets/new-icon.png",
  "tags": ["new", "icon", "example", "tag1", "tag2"]
}
```

3. Alternatively, you can add icons as Base64 strings directly in the `assets/icons.json` file. Each icon entry should have a `name`, `base64`, and `tags`. For example:

```json
{
  "name": "NewIconBase64",
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "tags": ["new", "icon", "example", "base64", "tag1"]
}
```

4. Restart the development server to apply the changes:
   ```sh
   npm run start:desktop:powerpoint
   ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
