import ResizeSensor from 'css-element-queries/src/ResizeSensor';

/**
 * Overall, this is similar to the function in Chaise
 * Difference:
 * Since the width of the dummy row-headers scrollbar should also change dynamically as the row headers content width changes,
 * the original function in Chaise does not configure this. This happens when we set the scrollable width as AUTO.
 * If we do not change the dummy scrollbar width, the scrollbar can not work well when the width of the content is larger than its initial width.
 * In this case, the user can not drag the scrollbar to the area exceeding the initial width.
 *
 * Some of the tables can be very long and the horizontal scroll only sits at the very bottom by default
 * A fixed horizontal scroll is added here that sticks to the top as we scroll vertically and horizontally
 * @param {DOMElement} content - the Grid Container element
 * @param {boolean} treeviewAuto - whether row header is treeview with auto scrollable size
 * @param {boolean?} fixedPos - whether the scrollbar is fixed position or not (if so, we will attach extra rules)
 * @param {HTMLElement?} extraSensorTarget - if we want to trigger the logic based on changes to another element
 */

export function addBottomHorizontalScroll(content: HTMLElement, treeviewAuto: boolean, fixedPos = false, extraSensorTarget?: HTMLElement) {
  if (!content) return;

  const topScrollElementWrapper = content.querySelector<HTMLElement>('.chaise-table-top-scroll-wrapper'),
    topScrollElement = content.querySelector<HTMLElement>('.chaise-table-top-scroll'),
    scrollableContent = content.querySelector<HTMLElement>('.grid-row-headers-container'),
    /** different from chaise **/
    // add listener for treeview headers
    headerContainer = content.querySelector<HTMLElement>('.grid-row-headers-treeview');

  if (!topScrollElementWrapper || !topScrollElement || !scrollableContent) {
    return;
  }

  // these 2 flags help us prevent cascading scroll changes back and forth across the 2 elements
  let isSyncingTopScroll = false;
  let isSyncingTableScroll = false;
  // keep scrollLeft equal when scrolling from either the scrollbar or mouse/trackpad
  topScrollElementWrapper.addEventListener('scroll', function () {
    if (!isSyncingTopScroll) {
      isSyncingTableScroll = true;
      scrollableContent!.scrollLeft = topScrollElementWrapper!.scrollLeft;

      /** different from chaise **/
      // Only for Treeview with auto scrollable size
      // When the element width does not match scrollableContent scrollWidth, we need to make them same
      if(treeviewAuto && topScrollElement!.style.width !== scrollableContent!.scrollWidth + 'px'){
        topScrollElement!.style.width = scrollableContent!.scrollWidth + 'px';
      }
    }
    isSyncingTopScroll = false;
  });

  scrollableContent.addEventListener('scroll', function () {
    if (!isSyncingTableScroll) {
      isSyncingTopScroll = true;
      topScrollElementWrapper!.scrollLeft = scrollableContent!.scrollLeft;

      /** different from chaise **/
      if(treeviewAuto && topScrollElement!.style.width !== scrollableContent!.scrollWidth + 'px'){
        topScrollElement!.style.width = scrollableContent!.scrollWidth + 'px';
      }
    }
    isSyncingTableScroll = false;
  });

  /** different from chaise **/
  // Just for Treeview with auto scrollable size
  // Add a listener to update the dummy scrollbar width when user click treeview
  // This could mean that the tree show one more layer or elipse one layer which effects the width of element
  if(treeviewAuto){
    headerContainer?.addEventListener('click', function () {
      if (scrollableContent!.scrollWidth !== scrollableContent!.clientWidth) {
        topScrollElementWrapper!.style.height = '15px';
        topScrollElement!.style.width = scrollableContent!.scrollWidth + 'px';
      }
    });
  }

  const setTopScrollStyles = () => {
    if (fixedPos) {
      topScrollElementWrapper!.style.width = `${scrollableContent.clientWidth}px`;
      topScrollElementWrapper!.style.marginTop = '-15px';
    }

    // there is no need of a scrollbar, content is not overflowing
    if (scrollableContent!.scrollWidth == scrollableContent!.clientWidth) {
      topScrollElement!.style.width = '0';
      topScrollElementWrapper!.style.height = '0';
    }
    else {
      topScrollElementWrapper!.style.height = '15px';
      topScrollElement!.style.width = scrollableContent!.scrollWidth + 'px';
    }
  }

  const sensors = [];

  // make sure that the length of the scroll is identical to the scroll at the bottom of the table
  sensors.push(new ResizeSensor(scrollableContent, setTopScrollStyles));

  if (extraSensorTarget) {
    sensors.push(new ResizeSensor(extraSensorTarget, setTopScrollStyles));
  }

  // make top scroll visible after adding the handlers to ensure its visible only when working
  topScrollElementWrapper.style.display = 'block';
  // show only if content is overflowing
  if (scrollableContent.scrollWidth == scrollableContent.clientWidth) {
    topScrollElementWrapper.style.height = '15px';
  }

  return sensors;
}

/**
 * Overall, this is similar to the function in Chaise
 * Difference:
 * 1.Since the height of the dummy column-headers scrollbar should also change dynamically as the column headers content height changes,
 * the original function in Chaise does not configure this. This happens when we set the scrollable height as AUTO.
 * If we do not change the dummy scrollbar height, the scrollbar can not work well when the height of the content is larger than its initial height.
 * In this case, the user can not drag the scrollbar to the area exceeding the initial height.
 * 2.Since we put the content of the column headers at the bottom of the scrollable area, and the text is read from
 * bottom to top, then the initial position of scroll bar should be at the bottom as well.
 * To handle this senario, there is a need to add new code
 * 3.This element is focus on vertical scroll, so it is different from the original one (horizontal scroll)
 * In this function, 'height' is used to substitute 'width' everywhere
 *
 * A fixed vertical scroll is added here that sticks to the top as we scroll vertically and horizontally
 * @param {DOMElement} content - the Grid Container element
 * @param {boolean} treeviewAuto - whether column header is treeview with auto scrollable size
 * @param {boolean?} fixedPos - whether the scrollbar is fixed position or not (if so, we will attach extra rules)
 * @param {HTMLElement?} extraSensorTarget - if we want to trigger the logic based on changes to another element
 */
export function addRightVerticalScroll(content: HTMLElement, treeviewAuto: boolean, fixedPos = false, extraSensorTarget?: HTMLElement) {
  if (!content) return;

  const topScrollElementWrapper = content.querySelector<HTMLElement>('.chaise-table-right-scroll-wrapper'),
    topScrollElement = content.querySelector<HTMLElement>('.chaise-table-right-scroll'),
    scrollableContent = content.querySelector<HTMLElement>('.grid-column-headers-container'),
    /** different from chaise **/
    // add listener for treeview headers
    headerContainer = content.querySelector<HTMLElement>('.grid-column-headers-treeview');

  if (!topScrollElementWrapper || !topScrollElement || !scrollableContent) {
    return;
  }

  // these 2 flags help us prevent cascading scroll changes back and forth across the 2 elements
  let isSyncingTopScroll = false;
  let isSyncingTableScroll = false;
  // keep scrollLeft equal when scrolling from either the scrollbar or mouse/trackpad
  topScrollElementWrapper.addEventListener('scroll', function () {
    if (!isSyncingTopScroll) {
      isSyncingTableScroll = true;
      scrollableContent!.scrollTop = topScrollElementWrapper!.scrollTop;

      /** different from chaise **/
      // Only for Treeview with auto scrollable size
      // When the element height does not match scrollableContent scrollHeight, we need to make them same
      if(treeviewAuto && topScrollElement!.style.height !== scrollableContent!.scrollHeight + 'px'){
        topScrollElement!.style.height = scrollableContent!.scrollHeight + 'px';
      }
    }
    isSyncingTopScroll = false;
  });

  scrollableContent.addEventListener('scroll', function () {
    if (!isSyncingTableScroll) {
      isSyncingTopScroll = true;
      topScrollElementWrapper!.scrollTop = scrollableContent!.scrollTop;

      /** different from chaise **/
      if(treeviewAuto && topScrollElement!.style.height !== scrollableContent!.scrollHeight + 'px'){
        topScrollElement!.style.height = scrollableContent!.scrollHeight + 'px';
      }
    }
    isSyncingTableScroll = false;
  });

  /** different from chaise **/
  // Just for Treeview with auto scrollable size
  // Add a listener to update the dummy scrollbar height when user click treeview
  // This could mean that the tree show one more layer or elipse one layer which effects the height of element
  if(treeviewAuto){
    headerContainer?.addEventListener('click', function () {
      if (scrollableContent!.scrollHeight !== scrollableContent!.clientHeight) {
        topScrollElementWrapper!.style.width = '15px';
        topScrollElement!.style.height = scrollableContent!.scrollHeight + 'px';
      }
    });
  }

  const setTopScrollStyles = () => {
    if (fixedPos) {
      topScrollElementWrapper!.style.height = `${scrollableContent.clientHeight}px`;
      topScrollElementWrapper!.style.marginLeft = '-15px';
    }

    /** different from chaise **/
    // Since when the scrollable height is auto, for tree-headers, it needs time to update the scrollHeight
    // so we set a delay function here
    setTimeout(() => {
       // there is no need of a scrollbar, content is not overflowing
      if (scrollableContent!.scrollHeight == scrollableContent!.clientHeight) {
        topScrollElement!.style.height = '0';
        topScrollElementWrapper!.style.width = '0';
      }
      else {
        topScrollElementWrapper!.style.width = '15px';
        topScrollElement!.style.height = scrollableContent!.scrollHeight + 'px';
      }
      // Initial the scroll bar position to the very bottom
      topScrollElementWrapper.scrollTo(0, scrollableContent!.scrollHeight);
    }, 100); // This slight delay ensures that the rendering is complete.
  }

  const sensors = [];

  // make sure that the length of the scroll is identical to the scroll at the bottom of the table
  sensors.push(new ResizeSensor(scrollableContent, setTopScrollStyles));

  if (extraSensorTarget) {
    sensors.push(new ResizeSensor(extraSensorTarget, setTopScrollStyles));
  }

  // make top scroll visible after adding the handlers to ensure its visible only when working
  topScrollElementWrapper.style.display = 'block';
  // show only if content is overflowing
  if (scrollableContent.scrollHeight == scrollableContent.clientHeight) {
    topScrollElementWrapper.style.width = '15px';
  }

  return sensors;
}

/**
 * find whether the given element has a scrollbar or not and return its size in pixels
 * (will return 0 if the element is invalid)
 *
 * @param element the HTML element or the string selector for it
 * @param horziontal by default we're checking for vertical scrollbar. pass `true` for this to check for horizontal.
 */
export function getScrollbarSize(element: HTMLElement | string, horziontal=false) : number {
  const el = typeof element === 'string' ? document.querySelector(element) as HTMLElement : element;

  if (!el) return 0;

  if (horziontal) {
    return el.offsetHeight - el.clientHeight;
  }
  return el.offsetWidth - el.clientWidth;
}
