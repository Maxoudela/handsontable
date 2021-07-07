/* eslint-disable jsdoc/require-description-complete-sentence */
import { arrayEach } from '../../../helpers/array';
import { createDefaultHeaderSettings, createPlaceholderHeaderSettings } from './utils';

/**
 * A function that dump a tree structure into multidimensional array. That structure is
 * later processed by header renderers to modify TH elements to achieve a proper
 * DOM structure.
 *
 * That structure contains settings object for every TH element generated by Walkontable.
 * The matrix operates on visual column index.
 *
 * Output example:
 *   [
 *     [
 *       { label: 'A1', colspan: 2, origColspan: 2, isHidden: false, ... },
 *       { label: '', colspan: 1, origColspan: 1, isHidden: true, ... },
 *       { label: '', colspan: 1, origColspan: 1, isHidden: false, ... },
 *     ],
 *     [
 *       { label: 'true', colspan: 1, origColspan: 1, isHidden: false, ... },
 *       { label: 'B2', colspan: 1, origColspan: 1, isHidden: false, ... },
 *       { label: '4', colspan: 1, origColspan: 1, isHidden: false, ... },
 *     ],
 *     [
 *       { label: '', colspan: 1, origColspan: 1, isHidden: false, ... },
 *       { label: '', colspan: 1, origColspan: 1, isHidden: false, ... },
 *       { label: '', colspan: 1, origColspan: 1, isHidden: false, ... },
 *     ],
 *   ]
 *
 * @param {TreeNode[]} headerRoots An array of root nodes.
 * @returns {Array[]}
 */
export function generateMatrix(headerRoots) {
  const matrix = [];

  arrayEach(headerRoots, (rootNode) => {
    rootNode.walkDown((node) => {
      const nodeData = node.data;
      const {
        origColspan,
        columnIndex,
        headerLevel,
        crossHiddenColumns,
      } = nodeData;
      const colspanHeaderLayer = createNestedArrayIfNecessary(matrix, headerLevel);
      let isRootSettingsFound = false;

      for (let i = columnIndex; i < columnIndex + origColspan; i++) {
        const isColumnHidden = crossHiddenColumns.includes(i);

        if (isColumnHidden || isRootSettingsFound) {
          colspanHeaderLayer.push(createPlaceholderHeaderSettings(nodeData));
        } else {
          const headerRootSettings = createHeaderSettings(nodeData);

          headerRootSettings.isRoot = true;
          colspanHeaderLayer.push(headerRootSettings);
          isRootSettingsFound = true;
        }
      }
    });
  });

  return matrix;
}

/**
 * Creates header settings object.
 *
 * @param {object} nodeData The tree data object.
 * @returns {object}
 */
function createHeaderSettings(nodeData) {
  // For the matrix module we do not need to export "crossHiddenColumns" key. It's redundant here.
  const { crossHiddenColumns, ...headerRootSettings } = createDefaultHeaderSettings(nodeData);

  return headerRootSettings;
}

/**
 * Internal helper which ensures that subarray exists under specified index.
 *
 * @param {Array[]} array An array to check.
 * @param {number} index An array index under the subarray should be checked.
 * @returns {Array}
 */
function createNestedArrayIfNecessary(array, index) {
  let subArray;

  if (Array.isArray(array[index])) {
    subArray = array[index];
  } else {
    subArray = [];
    array[index] = subArray;
  }

  return subArray;
}
