import './style.css';

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
                if (typeof child == 'object') {
                    return child;
                } else {
                    return createTextElement(child);
                }
            })
        }
    }
}

function createTextElement(text) {
    return {
        type: '#text',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

function createDom(fiber) {
    const dom =
        fiber.type == "#text"
            ? document.createTextNode("")
            : document.createElement(fiber.type)

    updateDom(dom, {}, fiber.props)

    return dom
}

const isEvent = key => key.startsWith("on");
const isProperty = key => key !== 'children' && !isEvent(key)
const isNew = (prev, next) => (key => prev[key] !== next[key]);
const isGone = (prev, next) => (key => !(key in next));
function updateDom(dom, prevProps, nextProps) {
    // Remove updated event listener
    Object.keys(prevProps)
    .filter(isEvent)
    .filter(
        isNew(prevProps, nextProps)
    ).forEach(name => {
        const eventType = name.toLowerCase().substring(2);
        dom.removeEventListener(
            eventType,
            prevProps[name]
        )
    })

    // Remove old properties
    Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((key) => {
        dom[key] = ""
    })

    // Update new properties
    Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
        dom[key] = nextProps[key]
    })

    // Add new event listeners
    Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((key) => {
        const eventName = key.toLowerCase().substring(2);
        dom.addEventListener(eventName, nextProps[key]);
    })
}

function commitRoot() {
    deletions.forEach(commitWork)
    commitWork(wipRoot.child)
    currentRoot = wipRoot
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }

    let domParentFiber = fiber.parent
    while(!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }

    const domParent = domParentFiber.dom
    if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
        updateDom(fiber.dom, fiber.alternate.props, fiber.props)
    } else if (fiber.effectTag === "DELETION") {
        commitDeletion(fiber.dom, domParent);
    }


    commitWork(fiber.child)
    commitWork(fiber.sibling)
} 

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent);
    }
}

let wipRoot = null;  // new root fiber
let currentRoot = null;  // old root fiber
let nextUnitOfWork = null;
let deletions = null;

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
        alternate: currentRoot
    }
    deletions = []
    nextUnitOfWork = wipRoot
}

const Didact = {
    createElement,
    render
}

// ===================== fiber    ====================
function workLoop(deadline) {
    while (nextUnitOfWork) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }
    requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
    const isFunctionComponent = fiber.type instanceof Function;
    if (isFunctionComponent) {
        updateFunctionComponent(fiber);
    } else {
        updateHostComponent(fiber);
    }

    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent
    }
}

function updateFunctionComponent(fiber) {
    const children = [fiber.type(fiber.props)];
    reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    reconcileChildren(fiber, fiber.props.children);
}

function reconcileChildren(parentFiber, elements) {
    let oldFiber = parentFiber.alternate && parentFiber.alternate.child;

    let index = 0;
    let prevSibling = null;
    while (index < elements.length || oldFiber) {
        const element = elements[index];

        const sameType =
            oldFiber &&
            element &&
            element.type === oldFiber.type

        let newFiber = null;
        if (sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: parentFiber,
                alternate: oldFiber,
                effectTag: 'UPDATE'
            }
        }

        if (element && !sameType) {
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: parentFiber,
                alternate: null,
                effectTag: "PLACEMENT"
            }
        }

        if (oldFiber && !sameType) {
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling
        }

        if (index == 0) {
            parentFiber.child = newFiber
        } else {
            prevSibling.sibling = newFiber
        }


        prevSibling = newFiber
        index++
    }
}


// ===================== real app ====================
function Counter() {
    // const [state, setState] = Didact.useState(1);

    return (
        <h1  style="user-select: none">
            Count: {1}
        </h1>
    )
}

const element = <Counter />
const container = document.getElementById('root');
Didact.render(element, container);

