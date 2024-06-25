function getPositions(parent, selector) {
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

function findClosestElement(positions, scrollTop) {
    return positions.reduce((closest, item) => {
        const distance = Math.abs(item.position - scrollTop);
        if (closest === null || distance < closest.distance) {
            return { ...item, distance };
        }
        return closest;
    }, null);
}

function getSourceAndTargetContainers(event) {
    const columns = ['text-column', 'images-column'];
    const sourceColumn = event.target.closest('.layout-column');

    const targetId = columns.filter((col) => col !== sourceColumn.id)[0];
    const targetColumn = document.getElementById(targetId);

    const sourceContainer = sourceColumn.children[0];
    const targetContainer = targetColumn.children[0];

    return { sourceContainer, targetContainer };
}

function findMatchingElement(container, index, selector) {
    let allElements = Array.from(container.querySelectorAll(selector));
    let connectedElements = allElements.filter(
        (el) => !el.classList.contains('active')
    );
    return connectedElements[index];
}

function highlightElement(container, element) {
    let allElements = Array.from(container.querySelectorAll('span.dot'));
    allElements.filter(
        (el) => el !== element
    ).forEach((el) => el.classList.remove('active'));
    element.classList.add('active');

    Array.from(document.querySelectorAll('.frame-container')).forEach(frameContainer => {
        if (frameContainer.contains(element)) {
            frameContainer.classList.add('active');
            frameContainer.querySelector('dot').add('active');
        } else {
            frameContainer.classList.remove('active');
            frameContainer.querySelector('dot').remove('active');
        }
    });
}

function scrollToElement(container, element) {
    const column = container.parentNode;
    const position = element.getBoundingClientRect().top + column.scrollTop;
    column.scrollTo({ top: position - 64, behavior: 'smooth' });
}

export function scrollHandler(event) {
    const scrollTop = this.scrollTop + 64;

    let { sourceContainer, targetContainer } = getSourceAndTargetContainers(event);

    let sourceSelector = sourceContainer.closest('.layout-column').id === 'text-column' ? 'span.dot' : '.frame-container.connected';
    let targetSelector = sourceContainer.closest('.layout-column').id === 'text-column' ? '.frame-container.connected' : 'span.dot';

    let sourcePositions = getPositions(sourceContainer, sourceSelector);
    let sourceElement = findClosestElement(sourcePositions, scrollTop);

            console.log(sourceElement)

    if (sourceElement.element.classList.contains('active')) {
        return;
    }

    let targetElement = findMatchingElement(targetContainer, sourceElement.connected_index, targetSelector);

    if (targetElement) {
        let targetContainerParent = targetElement.closest('.frame-container') || targetElement.closest('.page');
        let sourceContainerParent = sourceElement.element.closest('.frame-container') || sourceElement.element.closest('.page');

        if (!targetContainerParent.classList.contains('hidden') && !sourceContainerParent.classList.contains('hidden')) {
            scrollToElement(targetContainer, targetElement);
        }

        highlightElement(sourceContainer, sourceElement.element);
        highlightElement(targetContainer, targetElement);
    }

    let allDots = Array.from(document.querySelectorAll('.chrono-link .dot'));
    allDots.forEach(dot => {
        dot.addEventListener('click', dotClickHandler);
    });
}

function dotClickHandler(event) {
    let textColumn = document.getElementById('text-column');
    let imagesColumn = document.getElementById('images-column');

    let sourceContainer = textColumn.children[0];
    let targetContainer = imagesColumn.children[0];

    let clickedDotId = event.target.dataset.dotId;

    scrollToElement(sourceContainer, event.target);

    highlightElement(sourceContainer, event.target);

    let matchingDot = targetContainer.querySelector(`span.dot[data-dot-id="${clickedDotId}"]`);

    if (matchingDot) {
        scrollToElement(targetContainer, matchingDot.closest('.frame-container.connected') || matchingDot);
        highlightElement(targetContainer, matchingDot.closest('.frame-container.connected') || matchingDot);
    }
}

export function handleP5Scroll(element) {
    const scrollTop = element.scrollTop + 64;

    let sourceContainer = element.children[0];
    let targetContainerId = element.id === 'text-column' ? 'images-column' : 'text-column';
    let targetContainer = document.getElementById(targetContainerId).children[0];

    let sourceSelector = element.id === 'text-column' ? 'span.dot' : '.frame-container.connected';
    let targetSelector = element.id === 'text-column' ? '.frame-container.connected' : 'span.dot';

    let sourcePositions = getPositions(sourceContainer, sourceSelector);
    let sourceElement = findClosestElement(sourcePositions, scrollTop);

    if (sourceElement.element.classList.contains('active')) {
        return;
    }

    let targetElement = findMatchingElement(targetContainer, sourceElement.connected_index, targetSelector);

    if (targetElement) {
        let targetContainerParent = targetElement.closest('.frame-container') || targetElement.closest('.page');
        let sourceContainerParent = sourceElement.element.closest('.frame-container') || sourceElement.element.closest('.page');

        if (!targetContainerParent.classList.contains('hidden') && !sourceContainerParent.classList.contains('hidden')) {
            scrollToElement(targetContainer, targetElement);
        }

        highlightElement(sourceContainer, sourceElement.element);
        highlightElement(targetContainer, targetElement);
    }
}
