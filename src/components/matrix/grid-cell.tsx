import { memo, CSSProperties } from 'react';
import { areEqual } from 'react-window';

export type GridCellProps = {
  columnIndex: number;
  rowIndex: number;
  data: any;
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

  let gridCellClassName =
    hoveredRowIndex === rowIndex || hoveredColIndex === columnIndex
      ? 'grid-cell hovered-cell'
      : 'grid-cell unhovered-cell';

  if (searchedRowIndex === rowIndex || searchedColIndex === columnIndex) {
    gridCellClassName += ' searched-cell';
  }

  if (rowIndex === gridData.length - 1 || columnIndex === gridData[0].length - 1) {
    gridCellClassName = 'margin-cell';
  }

  return (
    <div
      style={style}
      onMouseEnter={() => {
        setHoveredColIndex(columnIndex);
        setHoveredRowIndex(rowIndex);
      }}
    >
      <div className={gridCellClassName}>
        {link ? (
          <a role='button' className='cell-link' href={link} title={title ? title : 'unknown'}>
            <MemoizedColorParts colorScale={colorScale} colors={colors} />
          </a>
        ) : (
          <MemoizedColorParts colorScale={colorScale} colors={colors} />
        )}
      </div>
    </div>
  );
};

type ColorPartsProps = {
  colors: Array<number>;
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
  color: string;
};

const Color = ({ color }: ColorProps): JSX.Element => (
  <div className='color-part' style={{ backgroundColor: color }} />
);

const MemoizedColor = memo(Color);

export default memo(GridCell, areEqual);
