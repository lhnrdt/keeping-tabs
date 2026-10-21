// Prints versions for the deploy workflows (runs with plain `node`, no build step).
//
//   node scripts/version.ts rc <ref>        release candidate for a staging commit
//   node scripts/version.ts release <ref>   release for the staging commit being shipped
//   node scripts/version.ts check-title "<PR title>"
//
// <ref> is a commit on the staging branch; its feature PRs are the first-parent
// merge commits since the latest release tag.
import { execFileSync } from 'node:child_process';
import { isValidPrTitle, latestRelease, nextVersion, releaseCandidate } from './versioning.ts';

const git = (...args: string[]) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const lines = (text: string) => text.split('\n').filter(Boolean);

function mergedPrTitles(ref: string, since: string) {
	const range = since === '0.0.0' ? ref : `v${since}..${ref}`;
	return lines(git('log', '--merges', '--first-parent', '--format=%s', range));
}

const [command, arg] = process.argv.slice(2);

if (command === 'check-title') {
	if (!isValidPrTitle(arg ?? '')) {
		console.error(`PR title must look like "feat: Add expenses" (got "${arg}")`);
		process.exit(1);
	}
} else if (command === 'rc' || command === 'release') {
	const current = latestRelease(lines(git('tag', '--list', 'v*')));
	const titles = mergedPrTitles(arg ?? 'HEAD', current);
	const version =
		command === 'rc' ? releaseCandidate(current, titles) : nextVersion(current, titles);
	if (!version) {
		console.error(`Nothing merged since v${current}`);
		process.exit(1);
	}
	console.log(version);
} else {
	console.error('Usage: node scripts/version.ts rc|release <ref> | check-title "<title>"');
	process.exit(2);
}
