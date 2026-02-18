/**
 * Icon generation helper script.
 * 
 * Since we can't generate PNG icons programmatically without
 * canvas/sharp libraries, use one of these methods:
 * 
 * Option A (Recommended): Use an online tool
 *   1. Go to https://cloudconvert.com/svg-to-png
 *   2. Upload public/icon-192x192.svg → Download as PNG (192×192)
 *   3. Upload public/icon-512x512.svg → Download as PNG (512×512)
 *   4. Save to public/ as icon-192x192.png, icon-512x512.png
 *   5. Create maskable versions (same image, safe zone padding):
 *      - icon-maskable-192x192.png
 *      - icon-maskable-512x512.png
 * 
 * Option B: Use sharp (install first)
 *   npm install --save-dev sharp
 *   Then run: node scripts/generate-icons.js
 */

async function main() {
    try {
        const sharp = (await import('sharp')).default;
        const fs = await import('fs');
        const path = await import('path');

        const publicDir = path.resolve(import.meta.dirname, '..', 'public');

        for (const size of [192, 512]) {
            const svgPath = path.join(publicDir, `icon-${size}x${size}.svg`);
            const pngPath = path.join(publicDir, `icon-${size}x${size}.png`);
            const maskablePath = path.join(publicDir, `icon-maskable-${size}x${size}.png`);

            const svgBuffer = fs.readFileSync(svgPath);

            // Standard icon
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(pngPath);
            console.log(`✓ Generated ${pngPath}`);

            // Maskable icon (same image — maskable safe zone is in the SVG's rounded rect already)
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(maskablePath);
            console.log(`✓ Generated ${maskablePath}`);
        }

        console.log('\nAll icons generated successfully!');
    } catch (err) {
        if (err.code === 'ERR_MODULE_NOT_FOUND' || err.message?.includes('sharp')) {
            console.error('sharp is not installed. Run: npm install --save-dev sharp');
            console.error('Then re-run: node scripts/generate-icons.js');
        } else {
            throw err;
        }
    }
}

main();
