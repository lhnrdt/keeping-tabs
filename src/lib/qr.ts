// A QR code as an SVG path (#70): drawn here, so it's plain markup with no image or script.
import qrcode from 'qrcode-generator';

/** Light cells around the code, as scanners expect */
const QUIET_ZONE = 4;

/** `size`: the square's side in cells, `path`: its dark cells */
export function qrPath(text: string) {
	const code = qrcode(0, 'M');
	code.addData(text);
	code.make();
	const count = code.getModuleCount();
	let path = '';
	for (let row = 0; row < count; row++) {
		for (let column = 0; column < count; column++) {
			if (code.isDark(row, column)) {
				path += `M${column + QUIET_ZONE} ${row + QUIET_ZONE}h1v1h-1z`;
			}
		}
	}
	return { size: count + QUIET_ZONE * 2, path };
}
