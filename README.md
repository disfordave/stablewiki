# StableWiki

StableWiki is an open-source Next.js application designed to provide a user-friendly platform for collaborative knowledge sharing. 

## Installation
To install StableWiki, follow these steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/disfordave/stablewiki.git
    ```
2. Navigate to the project directory:
   ```bash
   cd stablewiki
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Change .env.example to .env and configure your environment variables.

5. Run the development server:
   ```bash
   npm run dev
   ```

## Configuration
`src/config.ts` contains various configuration options for StableWiki. such as...

 - `WIKI_NAME`: The name of your wiki.
 - `WIKI_HOMEPAGE_LINK`: The link to the homepage of your wiki.
 - `WIKI_DESCRIPTION`: A brief description of your wiki.
 - `WIKI_COPYRIGHT_HOLDER`: The copyright holder for your wiki.
 - `WIKI_COPYRIGHT_HOLDER_URL`: The URL for the copyright holder.
 - `WIKI_DISABLE_MEDIA`: A boolean to enable or disable media uploads.

## Important Notes

1. **StableWiki is a still in the very, very early stages of development.**

2. StableWiki relies on Node.js based modules that require a full Node.js environment to run properly. **Serverless platforms that do not support full Node.js modules nor persistent file storage will not be able to host StableWiki.** 

## Features
- User authentication and authorization
- Rich text editor for creating and editing articles
- Version control for articles
- Search functionality
- Responsive design for mobile and desktop  
- API integration for external data sources

## Contributing
Contributions are welcome! Especially for contributions to make StableWiki compatible with serverless platforms and external storage solutions! 

Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License
This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.