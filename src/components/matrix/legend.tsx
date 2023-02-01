import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import Cell, { CellProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/cell';
import HeaderRow, {
  HeaderRowProps,
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/header-row';

export type LegendProps = {
  cells: Array<CellProps>;
  header?: HeaderRowProps;
};

const Legend = ({ cells, header }: LegendProps): JSX.Element => {
  const LegendRow = (): JSX.Element => (
    <div className='matrix-row legend-row'>
      {cells.length > 0
        ? cells.map((data) => <Cell key={data.id} className='legend-cell' {...data} />)
        : null}
    </div>
  );

  return (
    <div className='legend'>
      <LegendRow />
      <HeaderRow {...header} />
    </div>
  );
};

export default Legend;
