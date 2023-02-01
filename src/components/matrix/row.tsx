import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

import Cell, { CellProps } from '@isrd-isi-edu/deriva-webapps/src/components/matrix/cell';

export type RowProps = {
  className?: string;
  id?: string;
  title?: string;
  link?: string;
  cells: Array<CellProps>;
};

const Row = ({ className, title, link, cells }: RowProps): JSX.Element => {
  return (
    <div className={`row ${className}`}>
      {title ? (
        <div className={'row-header'}>
          <a className='link-text' href={link} title={title}>
            {title}
          </a>
        </div>
      ) : null}
      {cells.length > 0
        ? cells.map((data) => <Cell className='matrix-cell' key={data.id} {...data} />)
        : null}
    </div>
  );
};

export default Row;
