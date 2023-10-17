import ResizeSensor from 'css-element-queries/src/ResizeSensor';

/**
 * Some of the tables can be very long and the horizontal scroll only sits at the very bottom by default
 * A fixed horizontal scroll is added here that sticks to the top as we scroll vertically and horizontally
 * @param {DOMElement} content - the scrollable content element
 * @param {DOMElement} scrollBar - the dummy scrollbar element
 * @param {boolean?} fixedPos - whether the scrollbar is fixed position or not (if so, we will attach extra rules)
 * @param {HTMLElement?} extraSensorTarget - if we want to trigger the logic based on changes to another element
 */
export function addBottomHorizontalScroll(content: HTMLElement, scrollBar: HTMLElement, fixedPos = false, extraSensorTarget?: HTMLElement) {
  if (!content || !scrollBar) return;

  const topScrollElementWrapper = scrollBar.querySelector<HTMLElement>('.chaise-table-top-scroll-wrapper'),
    topScrollElement = scrollBar.querySelector<HTMLElement>('.chaise-table-top-scroll'),
    scrollableContent = content.querySelector<HTMLElement>('.grid-row-headers-container');

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
    }
    isSyncingTopScroll = false;
  });

  scrollableContent.addEventListener('scroll', function () {
    if (!isSyncingTableScroll) {
      isSyncingTopScroll = true;
      topScrollElementWrapper!.scrollLeft = scrollableContent!.scrollLeft;
    }
    isSyncingTableScroll = false;
  });

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
 * A fixed vertical scroll is added here that sticks to the top as we scroll vertically and horizontally
 * @param {DOMElement} content - the scrollable content element
 * @param {DOMElement} scrollBar - the dummy scrollbar element
 * @param {number} scrollTreeYIniPos - the initial position of the scrollBar because the column headers have content 
 * at the very bottom and should scroll up
 * @param {boolean?} fixedPos - whether the scrollbar is fixed position or not (if so, we will attach extra rules)
 * @param {HTMLElement?} extraSensorTarget - if we want to trigger the logic based on changes to another element
 */
export function addRightVerticalScroll(content: HTMLElement, scrollBar: HTMLElement, scrollTreeYIniPos: number, fixedPos = false, extraSensorTarget?: HTMLElement) {
  if (!content || !scrollBar) return;

  const topScrollElementWrapper = scrollBar.querySelector<HTMLElement>('.chaise-table-top-scroll-wrapper'),
    topScrollElement = scrollBar.querySelector<HTMLElement>('.chaise-table-top-scroll'),
    scrollableContent = content;

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
    }
    isSyncingTopScroll = false;
  });

  scrollableContent.addEventListener('scroll', function () {
    if (!isSyncingTableScroll) {
      isSyncingTopScroll = true;
      topScrollElementWrapper!.scrollTop = scrollableContent!.scrollTop;
    }
    isSyncingTableScroll = false;
  });

  const setTopScrollStyles = () => {
    if (fixedPos) {
      topScrollElementWrapper!.style.height = `${scrollableContent.clientHeight}px`;
      topScrollElementWrapper!.style.marginLeft = '-15px';
    }

    // there is no need of a scrollbar, content is not overflowing
    if (scrollableContent!.scrollHeight == scrollableContent!.clientHeight) {
      topScrollElement!.style.height = '0';
      topScrollElementWrapper!.style.width = '0';
    }
    else {
      topScrollElementWrapper!.style.width = '15px';
      topScrollElement!.style.height = scrollableContent!.scrollHeight + 'px';
    }
    topScrollElementWrapper.scrollTo(0, scrollTreeYIniPos); // Initial the scroll bar position to very bottom
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