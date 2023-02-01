import '@isrd-isi-edu/deriva-webapps/src/assets/scss/_matrix.scss';

export type HeaderRowProps = {
  className?: string;
  headers?: Array<{
    id?: string;
    className?: string;
    link?: string;
    title?: string;
  }>;
};

const HeaderRow = ({ className, headers }: HeaderRowProps): JSX.Element => {
  const RowElements = (): JSX.Element => (
    <>
      {headers?.map(({ id, className, title, link }) => {
        return title ? (
          <div key={id} className={`${className ? className : 'table-text-container'}`}>
            <a className={'link-text'} href={link} title={title}>
              {title}
            </a>
          </div>
        ) : null;
      })}
    </>
  );

  return (
    <div className={`matrix-row ${className ? className : ''}`}>
      {headers && headers.length > 0 ? <RowElements /> : null}
    </div>
  );
};

export default HeaderRow;
