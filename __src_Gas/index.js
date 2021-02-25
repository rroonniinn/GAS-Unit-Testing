// @ts-nocheck
// import { getRangeType } from '../../GAS | Library/v02/gas/qunit/getRangeType';
// import { getLastNotEmptyRowInCol } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyRowInCol';
// import { getLastNotEmptyColInRow } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyColInRow';
// import { getRangeRelative } from '../../GAS | Library/v02/gas/qunit/getRangeRelative';
// import { isColumn } from '../../GAS | Library/v02/gas/qunit/isColumn';
// import { getRangeRestricted } from '../../GAS | Library/v02/gas/qunit/getRangeRestricted';
// import { getFirstCellFromString } from '../../GAS | Library/v02/gas/qunit/getFirstCellFromString';
// import { getColAndRowFromCellAsNum } from '../../GAS | Library/v02/gas/qunit/getColAndRowFromCellAsNum';
// import { getIdFromUrl } from '../../GAS | Library/v02/gas/qunit/getIdFromUrl';
import { randomFromArray } from '../../../00. My Library Local/v02/arr/qunit/randomFromArray';
import { isEmpty } from '../../../00. My Library Local/v02/utils/qunit/isEmpty';

import {} from './env';

global.tests = () => {
	// isColumn();
	// getLastNotEmptyRowInCol();
	// getLastNotEmptyColInRow();
	// getRangeType();
	// getRangeRelative();
	// getRangeRestricted();
	// getFirstCellFromString();
	// getColAndRowFromCellAsNum();
	// getIdFromUrl();
	// randomFromArray();
	isEmpty().arrays();
	isEmpty().objects();
	isEmpty().primitives();
};
