// The dataset is large, so it's loaded on demand (code-split) and only once.
import { buildDatasetIndex, type DatasetIndex } from './index';

let loading: Promise<DatasetIndex> | undefined;

export const loadDataset = () =>
	(loading ??= import('./keywords.json').then((module) =>
		buildDatasetIndex(module.default.keywords)
	));
