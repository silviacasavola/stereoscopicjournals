
export function getPositions(parent, selector) {
    const parentElement = document.getElementById(parent.id);
    let allElements = Array.from(parentElement.querySelectorAll(selector));
    let connected = allElements.filter(
        (el) => !el.classList.contains('active')
    );
    let scrollOffset = parentElement.parentNode.scrollTop;

    let elementPositions = allElements.map((element, index) => ({
        element: element,
        position: element.getBoundingClientRect().top + scrollOffset - 10,
        all_index: index,
        connected_index: connected.indexOf(element)
    }));

    return elementPositions;
}

export function findClosestElement(positions, scrollTop) {
    return positions.reduce((closest, item) => {
        const distance = Math.abs(item.position - scrollTop);
        if (closest === null || distance < closest.distance) {
            return { ...item, distance };
        }
        return closest;
    }, null);
}

export function findClosestElementWithRange(positions, scrollTop, lastClosest, range) {
    const viewportTop = scrollTop + range.top;
    const viewportBottom = scrollTop - range.bottom;

    // Find the closest element within the range
    let closestInRange = positions.reduce((closest, item) => {
        const distance = item.position - scrollTop;
        if (distance <= range.top && distance >= -range.bottom) {
            if (closest === null || Math.abs(distance) < Math.abs(closest.distance)) {
                return { ...item, distance };
            }
        }
        return closest;
    }, null);

    // Only update if we found a new closest element within the range
    if (closestInRange !== null) {
        return closestInRange;
    }

    // If no new element is within the range, return the last closest element
    return lastClosest;
}

export function getSourceAndTargetContainers(event) {
    const columns = ['text-column', 'images-column'];
    const sourceColumn = event.target.closest('.layout-column');

    if (!sourceColumn) {
        console.error('No source column found.');
        return null;
    }

    const targetId = columns.filter((col) => col !== sourceColumn.id)[0];
    const targetColumn = document.getElementById(targetId);

    if (!targetColumn) {
        console.error('No target column found.');
        return null;
    }

    const sourceContainer = sourceColumn.children[0];
    const targetContainer = targetColumn.children[0];

    return { sourceContainer, targetContainer };
}

export function findMatchingElement(container, index, selector) {
    let allElements = Array.from(container.querySelectorAll(selector));
    let connectedElements = allElements.filter(
        (el) => !el.classList.contains('active')
    );
    return connectedElements[index];
}

export function highlightElement(container, element) {
    let allElements = Array.from(container.querySelectorAll('.active'));
    allElements.forEach((el) => el.classList.remove('active'));
    element.classList.add('active');
}

export function scrollToElement(container, element) {
    if (!container || !element) {
        console.error('Invalid container or element for scrolling.');
        return;
    }
    const column = container.parentNode;
    const position = element.getBoundingClientRect().top + column.scrollTop;
    column.scrollTo({ top: position - 70, behavior: 'smooth' });
}

let lastClosestElement = null;

export function scrollHandler(event) {
    const scrollTop = this.scrollTop - 70;
    const sourceColumnId = this.closest('.layout-column').id;

    let containers = getSourceAndTargetContainers(event);
    if (!containers) return;

    let { sourceContainer, targetContainer } = containers;

    let sourceSelector = sourceColumnId === 'text-column' ? '.chrono-link' : '.frame-container.connected';
    let targetSelector = sourceColumnId === 'text-column' ? '.frame-container.connected' : '.chrono-link';

    // Define different ranges for different columns
    let range = sourceColumnId === 'text-column' ? { top: 100, bottom: 0 } : { top: 200, bottom: 0 };

    let sourcePositions = getPositions(sourceContainer, sourceSelector);
    let sourceElement = findClosestElementWithRange(sourcePositions, scrollTop, lastClosestElement, range);

    if (sourceElement && sourceElement.element.classList.contains('active')) {
        return;
    }

    if (sourceElement && sourceElement !== lastClosestElement) {
        let targetElement = findMatchingElement(targetContainer, sourceElement.connected_index, targetSelector);

        if (targetElement) {
            highlightElement(sourceContainer, sourceElement.element);
            highlightElement(targetContainer, targetElement);

            // Scroll to the target element in the other column
            scrollToElement(targetContainer, targetElement);

            // Update the last closest element
            lastClosestElement = sourceElement;
        }
    }
}


export function attachDotsEventListeners() {
    setTimeout(() => {
        let allDots = Array.from(document.querySelectorAll('.dot')).filter(
            (d) => !d.classList.contains('disconnected')
        );

        if (!allDots.length) {
            console.error('No dots found.');
            return;
        }

        allDots.forEach(dot => {
            dot.addEventListener('click', function(event) {
                elementClickHandler(event);
            });
        });
    }, 1000);
}

function elementClickHandler(event) {
    let textColumn = document.getElementById('text-column');
    let imagesColumn = document.getElementById('images-column');

    let sourceColumn = event.target.closest('#text-column, #images-column');
    if (!sourceColumn) {
        console.error('No source column found for the clicked dot.');
        return;
    }

    let targetColumn = sourceColumn.id === 'text-column' ? imagesColumn : textColumn;

    let sourceContainer = sourceColumn.children[0];
    let targetContainer = targetColumn.children[0];

    let dataSelector = event.target.getAttribute('data-dot-id');
    if (dataSelector !== null) {
        let matchingDot = targetContainer.querySelector(`.dot[data-dot-id="${dataSelector}"]`);
        if (!matchingDot) {
            console.error('No matching dot found in the target container.');
            console.log(`Searching for .dot[data-dot-id="${dataSelector}"] in`, targetContainer);
            return;
        }

        console.log('Matching dot:', matchingDot);

        let matchingElement = matchingDot.closest('.frame-container.connected') || matchingDot.closest('.page');
        if (!matchingElement) {
            console.error('No matching element found for the matching dot.');
            return;
        }

        // Scroll to the clicked dot in the source container
        scrollToElement(sourceContainer, event.target);
        // Scroll to the matching element in the target container
        scrollToElement(targetContainer, matchingElement);
        highlightElement(sourceContainer, event.target);
        highlightElement(targetContainer, matchingElement);
    } else {
        console.error('No data-dot-id found for the clicked dot.');
    }
}

export function handleP5Scroll(element) {
    const scrollTop = element.scrollTop - 50;
    const sourceColumnId = element.closest('.layout-column').id;

    console.log(`handleP5Scroll called for ${sourceColumnId} at scrollTop ${scrollTop}`);

    let sourceContainer = element.children[0];
    let targetContainerId = sourceColumnId === 'text-column' ? 'images-column' : 'text-column';
    let targetContainer = document.getElementById(targetContainerId).children[0];

    let sourceSelector = sourceColumnId === 'text-column' ? '.chrono-link' : '.frame-container.connected';
    let targetSelector = sourceColumnId === 'text-column' ? '.frame-container.connected' : '.chrono-link';

    let sourcePositions = getPositions(sourceContainer, sourceSelector);
    let sourceElement = findClosestElement(sourcePositions, scrollTop);

    // Debug log for closest element
    console.log(`Closest element:`, sourceElement);

    // Update the last closest element and highlight elements even if outside the range
    if (sourceElement && sourceElement !== lastClosestElement) {
        let targetElement = findMatchingElement(targetContainer, sourceElement.connected_index, targetSelector);

        if (targetElement) {
            console.log(`Highlighting source element: ${sourceElement.element}`);
            highlightElement(sourceContainer, sourceElement.element);
            console.log(`Highlighting target element: ${targetElement}`);
            highlightElement(targetContainer, targetElement);

            // Scroll to the target element in the other column
            console.log(`Scrolling to target element: ${targetElement}`);
            scrollToElement(targetContainer, targetElement);

            // Update the last closest element
            lastClosestElement = sourceElement;
        } else {
            console.log(`No matching target element found for ${sourceElement.element}`);
        }
    } else {
        console.log(`No closest element found or closest element is the same as the last one`);
    }
}
