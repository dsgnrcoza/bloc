// Builds what /get serves: the iPhone web clip profile, the APK copy and a QR code that points at /get.
// usage: node get-assets.mjs
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { ROOT, SITE, LINK } from './brand.mjs';

const app = join(ROOT, 'app');
mkdirSync(join(app, 'download'), { recursive: true });

// Unsigned profile with one web clip. Fixed UUIDs, so installing it again replaces the old one instead of adding a second icon.
const icon = readFileSync(join(app, 'icons/apple-touch-icon.png')).toString('base64').replace(/.{1,76}/g, '\t\t\t$&\n');
const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>PayloadContent</key>
	<array>
		<dict>
			<key>FullScreen</key>
			<true/>
			<key>Icon</key>
			<data>
${icon}			</data>
			<key>IsRemovable</key>
			<true/>
			<key>Label</key>
			<string>Bloc</string>
			<key>PayloadDescription</key>
			<string>Adds Bloc to your Home Screen.</string>
			<key>PayloadDisplayName</key>
			<string>Bloc</string>
			<key>PayloadIdentifier</key>
			<string>app.getbloc.webclip</string>
			<key>PayloadType</key>
			<string>com.apple.webClip.managed</string>
			<key>PayloadUUID</key>
			<string>6B1E8C3A-4F2D-4B7E-9C51-2D8A7F0E3B64</string>
			<key>PayloadVersion</key>
			<integer>1</integer>
			<key>Precomposed</key>
			<true/>
			<key>URL</key>
			<string>https://${SITE}/</string>
		</dict>
	</array>
	<key>PayloadDescription</key>
	<string>Adds a Bloc icon to your Home Screen that opens the Bloc demo at ${SITE}. Nothing else on your iPhone changes, and you can remove it in Settings.</string>
	<key>PayloadDisplayName</key>
	<string>Bloc demo</string>
	<key>PayloadIdentifier</key>
	<string>app.getbloc.profile</string>
	<key>PayloadOrganization</key>
	<string>Bloc</string>
	<key>PayloadRemovalDisallowed</key>
	<false/>
	<key>PayloadType</key>
	<string>Configuration</string>
	<key>PayloadUUID</key>
	<string>A3C7F2D9-1E5B-4C8A-B6D4-9F0E2A7C5B13</string>
	<key>PayloadVersion</key>
	<integer>1</integer>
</dict>
</plist>
`;
writeFileSync(join(app, 'download/Bloc.mobileconfig'), plist);
copyFileSync(join(ROOT, 'release/BlocDEMO.apk'), join(app, 'download/BlocDEMO.apk'));
writeFileSync(join(app, 'icons/qr-get.svg'), await QRCode.toString('https://' + LINK, { type: 'svg', errorCorrectionLevel: 'M', margin: 1, color: { dark: '#0E1116', light: '#FFFFFF' } }));
console.log('get assets done');
