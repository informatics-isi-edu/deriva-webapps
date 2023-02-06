import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';
import { memo, CSSProperties } from 'react';

export type GridCellProps = {
  columnIndex: number;
  rowIndex: number;
  data: any;
  style: CSSProperties;
};

const GridCell = ({ columnIndex, rowIndex, data, style }: GridCellProps): JSX.Element => {
  const { hoveredRowIndex, setHoveredRowIndex, hoveredColIndex, setHoveredColIndex, gridData } =
    data;

  const { colors, link, title } = gridData[rowIndex][columnIndex];

  const gridCellClassName =
    hoveredRowIndex === rowIndex || hoveredColIndex === columnIndex
      ? 'grid-cell hovered-cell'
      : 'grid-cell unhovered-cell';

  const ColorParts = () => (
    <>
      {colors?.map((color: string, i: number) => (
        <div className='color-part' key={`${color}-${i}`} style={{ backgroundColor: color }} />
      ))}
    </>
  );

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
            <ColorParts />
          </a>
        ) : (
          <ColorParts />
        )}
      </div>
    </div>
  );
};

export default memo(GridCell);
