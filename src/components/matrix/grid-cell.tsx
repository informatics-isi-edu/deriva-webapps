import { memo, CSSProperties } from 'react';
import { areEqual } from 'react-window';

export type GridCellProps = {
  /**
   * Column index position of the grid cell
   */
  columnIndex: number;
  /**
   * Row index position of the grid cell
   */
  rowIndex: number;
  /**
   * Data passed to each grid cell
   */
  data: any;
  /**
   * Style of the grid cell
   */
  style: CSSProperties;
};

const GridCell = ({ columnIndex, rowIndex, data, style }: GridCellProps): JSX.Element => {
  const {
    hoveredRowIndex,
    setHoveredRowIndex,
    hoveredColIndex,
    setHoveredColIndex,
    searchedRowIndex,
    searchedColIndex,
    gridData,
    colorScale,
  } = data;

  const { colors, link, title } = gridData[rowIndex][columnIndex];

  // className changes based on hovered state
  let gridCellClassName =
    hoveredRowIndex === rowIndex || hoveredColIndex === columnIndex
      ? 'grid-cell hovered-cell'
      : 'grid-cell unhovered-cell';

  // className changes based on searched state
  if (searchedRowIndex === rowIndex || searchedColIndex === columnIndex) {
    gridCellClassName += ' searched-cell';
  }

  // className different for the last margin cell
  if (rowIndex === gridData.length - 1 || columnIndex === gridData[0].length - 1) {
    gridCellClassName = 'margin-cell';
  }

  return (
    <div
      className={gridCellClassName}
      style={style}
      onMouseEnter={() => {
        setHoveredColIndex(columnIndex);
        setHoveredRowIndex(rowIndex);
      }}
    >
      {link ? (
        <a role='button' className='cell-link' href={link} title={title ? title : 'unknown'}>
          <MemoizedColorParts colorScale={colorScale} colors={colors} />
        </a>
      ) : (
        <MemoizedColorParts colorScale={colorScale} colors={colors} />
      )}
    </div>
  );
};

type ColorPartsProps = {
  /**
   * Colors mapped by index
   */
  colors: Array<number>;
  /**
   * Color scale map
   */
  colorScale: Array<string>;
};

const ColorParts = ({ colors, colorScale }: ColorPartsProps): JSX.Element => {
  return (
    <>
      {colors.map((colorIndex, i) => (
        <MemoizedColor key={i} color={colorScale[colorIndex]} />
      ))}
    </>
  );
};

const MemoizedColorParts = memo(ColorParts, () => false);

type ColorProps = {
  /**
   * RGB color
   */
  color: string;
};

const Color = ({ color }: ColorProps): JSX.Element => (
  <div className='color-part' style={{ backgroundColor: color }} />
);

const MemoizedColor = memo(Color);

export default memo(GridCell, areEqual);
