import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

export type CellProps = {
  id?: string;
  className?: string;
  colors?: Array<string>;
  link?: string;
  title?: string;
};

const Cell = ({ className, colors, link, title }: CellProps): JSX.Element => {
  const ColorParts = () => (
    <>
      {colors?.map((color: string, i: number) => (
        <div className='color-part' key={`${color}-${i}`} style={{ backgroundColor: color }} />
      ))}
    </>
  );

  return (
    <div className={`cell ${className ? className : ''}`}>
      {link ? (
        <a className='cell-link' href={link} title={title ? title : 'unknown'}>
          <ColorParts />
        </a>
      ) : (
        <ColorParts />
      )}
    </div>
  );
};

export default Cell;
