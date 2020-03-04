import {} from './env';
import { getRangeType } from '../../GAS | Library/v02/gas/qunit/getRangeType';
import { getLastNotEmptyRowInCol } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyRowInCol';
import { getLastNotEmptyColInRow } from '../../GAS | Library/v02/gas/qunit/getLastNotEmptyColInRow';
import { getRangeRelative } from '../../GAS | Library/v02/gas/qunit/getRangeRelative';

global.tests = () => {
	// getRangeType();
	// getLastNotEmptyRowInCol();
	// getLastNotEmptyColInRow();
	getRangeRelative();
};
