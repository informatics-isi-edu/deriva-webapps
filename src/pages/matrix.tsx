import AppWrapper from '@isrd-isi-edu/chaise/src/components/app-wrapper';
import ReactDOM from 'react-dom';
import Example from '@isrd-isi-edu/deriva-webapps/src/components/example';

const matrixSettings = {
  appName: 'app/matrix',
  appTitle: 'Matrix',
  overrideHeadTitle: false,
  overrideDownloadClickBehavior: false,
  overrideExternalLinkBehavior: false
};

const MatrixApp = () : JSX.Element => {
  return (
    <>
      <div>Matrix app!</div>
      <div>{val}</div>
      <Example/>
    </>
  )
};

ReactDOM.render(
  <AppWrapper
    appSettings={matrixSettings}
    includeAlerts={true}
    includeNavbar={true}
    displaySpinner={true}
  >
    <MatrixApp />
  </AppWrapper>,
  document.getElementById('chaise-app-root'),
);
