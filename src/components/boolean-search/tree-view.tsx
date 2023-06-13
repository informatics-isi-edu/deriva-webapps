 /**
   * Renders the tree view component
   */
const TreeView = () => {
    const treeviewUrl =
      window.location.href.substring(0, window.location.href.indexOf('boolean-search')) +
      'treeview/index.html?Parent_App=booleanSearch&hideNavbar=true';
  
    return (
      <iframe
        title='TreeView'
        src={treeviewUrl}
        style={{ height: '100%', width: '100%' }}
      >
      </iframe>
    );
  };
  
  export default TreeView;
  