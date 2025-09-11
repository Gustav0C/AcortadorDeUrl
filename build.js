#!/usr/bin/env node

/**
 * Build script para generar version estatica de la aplicacion
 * Este script genera archivos optimizados para GitHub Pages
 */

const fs = require('fs');
const path = require('path');

console.log('🔨 Building static version for GitHub Pages...');

// Crear directorio de salida
const outputDir = '_site';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Copiar archivos estáticos
const publicDir = 'public';
const filesToCopy = [
    'styles.css',
    'script-static.js', 
    'index.html',  // Usar el index original, no el estático
    'logo.png'
];

filesToCopy.forEach(file => {
    const sourcePath = path.join(publicDir, file);
    let destPath = path.join(outputDir, file);
    
    // Renombrar solo el script
    if (file === 'script-static.js') {
        destPath = path.join(outputDir, 'script.js');
    }
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Copied: ${file} -> ${path.basename(destPath)}`);
    } else {
        console.log(`⚠️  File not found: ${sourcePath}`);
    }
});

// Crear archivo .nojekyll para GitHub Pages
fs.writeFileSync(path.join(outputDir, '.nojekyll'), '');
console.log('✅ Created .nojekyll file');

// Crear robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://gustav0c.github.io/AcortadorDeUrl/sitemap.xml`;

fs.writeFileSync(path.join(outputDir, 'robots.txt'), robotsTxt);
console.log('✅ Created robots.txt');

// Crear un sitemap básico
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gustav0c.github.io/AcortadorDeUrl/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap);
console.log('✅ Created sitemap.xml');

console.log('🎉 Build completed successfully!');
console.log(`📁 Output directory: ${outputDir}`);
console.log('📋 Files generated:');
fs.readdirSync(outputDir).forEach(file => {
    console.log(`   - ${file}`);
});
