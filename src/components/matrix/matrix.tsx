import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import HeaderRow, {
  HeaderRowProps,
} from '@isrd-isi-edu/deriva-webapps/src/components/matrix/header-row';
import Legend, { LegendProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/legend';
import Row, { RowProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/row';

export type MatrixProps = {
  matrixData: {
    rows: Array<RowProps>;
    headers: HeaderRowProps['headers'];
    legend: LegendProps;
  };
};

const Matrix = ({ matrixData }: MatrixProps): JSX.Element => {
  const { rows = [], headers = [], legend = { cells: [], header: {} } } = matrixData;
  const MatrixTable = (): JSX.Element => (
    <>
      {rows.length > 0
        ? rows.map((data: RowProps) => <Row className='matrix-row' key={data.id} {...data} />)
        : null}
    </>
  );

  return (
    <div className='matrix'>
      <HeaderRow className={'col-headers'} headers={headers} />
      <MatrixTable />
      <Legend cells={legend.cells} header={legend.header} />
    </div>
  );
};

export default Matrix;
