import { getRangeType } from '../../GAS | Library/v02/gas/qunit/getRangeType';
import { getLastNotEmptyRowInCol } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyRowInCol';
import { getLastNotEmptyColInRow } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyColInRow';
import { getRangeRelative } from '../../GAS | Library/v02/gas/qunit/getRangeRelative';
import { isColumn } from '../../GAS | Library/v02/gas/qunit/isColumn';
import { getRangeRestricted } from '../../GAS | Library/v02/gas/qunit/getRangeRestricted';

import {} from './env';

global.tests = () => {
	// isColumn();
	// getLastNotEmptyRowInCol();
	// getLastNotEmptyColInRow();
	// getRangeType();
	getRangeRelative();
	// getRangeRestricted();
};
